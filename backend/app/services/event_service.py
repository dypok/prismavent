from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.event import STATUS_SEQUENCE
from app.services import budget_service

def auto_transition_event_status(event: dict, db: Session) -> dict:
    """
    Auto-advance event status based on dates:
    - confirmado → in_progress when now >= event_date
    - in_progress → done when now >= event_date + duration (or +24h if no duration)
    Returns the event dict with updated status (or unchanged).
    """
    current = event.get("status")
    event_date = event.get("event_date")
    duration = event.get("duration", 0) or 0
    now = datetime.now(timezone.utc)

    if not event_date or not current:
        return event

    if isinstance(event_date, str):
        event_date = datetime.fromisoformat(event_date.replace('Z', '+00:00'))

    if event_date.tzinfo is None:
        event_date = event_date.replace(tzinfo=timezone.utc)

    new_status = None
    if current == "confirmado" and now >= event_date:
        new_status = "in_progress"
    elif current == "in_progress":
        if duration and duration > 0:
            end_time = event_date + timedelta(minutes=duration)
        else:
            end_time = event_date + timedelta(days=1)
        if now >= end_time:
            new_status = "done"

    if new_status and new_status != current:
        db.execute(
            text("UPDATE events SET status = :status, updated_at = NOW() WHERE id = :id"),
            {"id": event["id"], "status": new_status}
        )
        db.execute(
            text("""
                INSERT INTO event_history (event_id, previous_status, new_status, changed_by)
                VALUES (:event_id, :previous_status, :new_status, NULL)
            """),
            {"event_id": event["id"], "previous_status": current, "new_status": new_status}
        )
        db.commit()
        event["status"] = new_status

    return event

def validate_status_transition(current_status: str, new_status: str) -> None:
    """
    Raises HTTP 400 if new_status is not the immediately next status
    in the STATUS_SEQUENCE after current_status.
    """
    try:
        current_index = STATUS_SEQUENCE.index(current_status)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Estado actual inválido: '{current_status}'"
        )

    if current_index >= len(STATUS_SEQUENCE) - 1:
        raise HTTPException(
            status_code=400,
            detail=f"El estado '{current_status}' es el final de la secuencia y no puede cambiar"
        )

    expected_next = STATUS_SEQUENCE[current_index + 1]
    if new_status != expected_next:
        raise HTTPException(
            status_code=400,
            detail=f"Desde '{current_status}' solo se puede avanzar al estado '{expected_next}', no a '{new_status}'"
        )

def validate_event_not_finalized(current_status: str) -> None:
    """
    Raises a 400 Bad Request error if the event's status is 'finalizado' or 'done'.
    """
    if current_status in ("finalizado", "done"):
        raise HTTPException(status_code=400, detail="No se puede modificar un evento finalizado")

def validate_event_date_not_past(new_date: datetime | None) -> None:
    """
    Raises a 400 Bad Request error if the new event_date is in the past.
    """
    if new_date is not None:
        if isinstance(new_date, str):
            new_date = datetime.fromisoformat(new_date.replace('Z', '+00:00'))
        if new_date.tzinfo is None:
            new_date = new_date.replace(tzinfo=timezone.utc)
        if new_date < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="event_date no puede ser una fecha en el pasado")

def validate_guest_count_editable(payload_guest_count: int | None, guest_tracking_enabled: bool) -> None:
    """
    Raises a 400 Bad Request error if the client attempts to manually set guest_count
    when guest tracking by name is enabled.
    """
    if payload_guest_count is not None and guest_tracking_enabled:
        raise HTTPException(
            status_code=400,
            detail="guest_count se calcula automáticamente desde la lista de invitados y no puede editarse manualmente"
        )

def validate_event_is_draft(status: str) -> None:
    """
    Raises a 400 Bad Request error if the event's status is not 'borrador'.
    """
    if status != "borrador":
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden eliminar eventos en estado borrador"
        )

def get_event_detail(event_id: str, db: Session) -> dict:
    """
    Fetches the event and its associated details (items, guests, budget, guest counters)
    and returns a dictionary matching the EventDetailOut schema.
    """
    # 1. Fetch event details first by id
    event_res = db.execute(
        text("SELECT * FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
        
    event = dict(event_res._mapping)
    
    # 1b. Fetch event type name
    event_type_name = None
    if event.get("event_type_id"):
        et_res = db.execute(
            text("SELECT name FROM event_types WHERE id = :id"),
            {"id": event["event_type_id"]}
        ).fetchone()
        if et_res:
            event_type_name = et_res[0]
    event["event_type_name"] = event_type_name

    # 1c. Fetch city name
    city_name = None
    if event.get("city_id"):
        city_res = db.execute(
            text("SELECT name FROM cities WHERE id = :id"),
            {"id": event["city_id"]}
        ).fetchone()
        if city_res:
            city_name = city_res[0]
    event["city_name"] = city_name
    
    # 2. Fetch associated event items
    items_res = db.execute(
        text("SELECT * FROM event_items WHERE event_id = :event_id"),
        {"event_id": event_id}
    ).fetchall()
    
    event_items = [dict(item._mapping) for item in items_res] if items_res else []
    
    # 3. Fetch associated guests
    guests_res = db.execute(
        text("SELECT * FROM guests WHERE event_id = :event_id ORDER BY created_at ASC"),
        {"event_id": event_id}
    ).fetchall()
    
    guests = [dict(g._mapping) for g in guests_res] if guests_res else []
    
    # 4. Calculate budget metrics using database summation
    total_estimated = budget_service.calculate_total(event_id, db)
    budget_alert = budget_service.check_budget_alert(total_estimated, event.get("max_budget"))
    amount_over_budget = budget_service.get_amount_over_budget(total_estimated, event.get("max_budget"))
    
    # 4b. Calculate total_gastado (sum of confirmed items only)
    gastado_res = db.execute(
        text("SELECT COALESCE(SUM(quantity * unit_price), 0) FROM event_items WHERE event_id = :event_id AND confirmed = true"),
        {"event_id": event_id}
    ).scalar()
    total_gastado = gastado_res
    
    # 5. Calculate guest counters
    registered_guests_count = len(guests)
    confirmed_guests_count = sum(1 for g in guests if g["confirmed"])
    unconfirmed_guests_count = registered_guests_count - confirmed_guests_count
    
    # 6. Populate response dictionary
    event["event_items"] = event_items
    event["guests"] = guests
    event["registered_guests_count"] = registered_guests_count
    event["confirmed_guests_count"] = confirmed_guests_count
    event["unconfirmed_guests_count"] = unconfirmed_guests_count
    event["total_estimated"] = total_estimated
    event["total_gastado"] = total_gastado
    event["over_budget"] = budget_alert
    event["budget_exceeded_by"] = amount_over_budget
    
    return event

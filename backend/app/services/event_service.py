from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.event import STATUS_SEQUENCE, EventCreate, EventUpdate
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


def _verify_ownership(event_id: str, user_id: str, db: Session) -> dict:
    event_res = db.execute(
        text("SELECT * FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    event = dict(event_res._mapping)
    if str(event["user_id"]) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")
    return event


def _fetch_template_items(payload: EventCreate, db: Session) -> list:
    if payload.template_id:
        temp_res = db.execute(
            text("SELECT default_items FROM templates WHERE id = :id"),
            {"id": payload.template_id}
        ).fetchone()
        return temp_res[0] or [] if temp_res else []
    if payload.user_template_id:
        temp_res = db.execute(
            text("SELECT items FROM user_templates WHERE id = :id"),
            {"id": payload.user_template_id}
        ).fetchone()
        return temp_res[0] or [] if temp_res else []
    return []


def _clone_items_to_event(event_id: str, items: list, db: Session) -> None:
    for item in items:
        quantity = item.get("quantity", 1)
        if not isinstance(quantity, int) or quantity < 1:
            quantity = 1
        price = item.get("reference_price", item.get("unit_price", 0))
        try:
            price = float(price)
            if price < 0:
                price = 0.0
        except (ValueError, TypeError):
            price = 0.0
        db.execute(
            text("""
                INSERT INTO event_items (event_id, name, quantity, unit_price, confirmed)
                VALUES (:event_id, :name, :quantity, :unit_price, :confirmed)
            """),
            {
                "event_id": event_id,
                "name": item.get("name", "Item sin nombre"),
                "quantity": quantity,
                "unit_price": price,
                "confirmed": False,
            }
        )


def create_event(user_id: str, payload: EventCreate, db: Session) -> dict:
    default_items = _fetch_template_items(payload, db)

    result = db.execute(
        text("""
            INSERT INTO events (
                user_id, name, description, event_date, guest_count, max_budget,
                template_id, user_template_id, city_id, city_custom, event_type_id,
                location, duration, status, visibility_status
            ) VALUES (
                :user_id, :name, :description, :event_date, :guest_count, :max_budget,
                :template_id, :user_template_id, :city_id, :city_custom, :event_type_id,
                :location, :duration, :status, :visibility_status
            ) RETURNING id, user_id, city_id, city_custom, event_type_id, template_id, user_template_id, name, description, location, event_date, guest_count, max_budget, status, visibility_status, created_at, updated_at
        """),
        {
            "user_id": user_id,
            "name": payload.name,
            "description": payload.description,
            "event_date": payload.event_date,
            "guest_count": payload.guest_count,
            "max_budget": float(payload.max_budget) if payload.max_budget is not None else None,
            "template_id": payload.template_id,
            "user_template_id": payload.user_template_id,
            "city_id": payload.city_id,
            "city_custom": payload.city_custom,
            "event_type_id": payload.event_type_id,
            "location": payload.location,
            "duration": payload.duration,
            "status": "borrador",
            "visibility_status": payload.visibility_status,
        }
    ).fetchone()

    if not result:
        raise HTTPException(status_code=400, detail="Failed to create event in database")

    created_event = dict(result._mapping)
    if default_items:
        _clone_items_to_event(created_event["id"], default_items, db)
    db.commit()
    return created_event


def update_event(event_id: str, user_id: str, payload: EventUpdate, db: Session) -> dict:
    event = _verify_ownership(event_id, user_id, db)
    validate_event_not_finalized(event["status"])
    validate_event_date_not_past(payload.event_date)
    validate_guest_count_editable(payload.guest_count, event.get("guest_tracking_enabled", False))

    updated = db.execute(
        text("""
            UPDATE events
            SET name = COALESCE(:name, name),
                description = COALESCE(:description, description),
                event_date = COALESCE(:event_date, event_date),
                guest_count = COALESCE(:guest_count, guest_count),
                max_budget = COALESCE(:max_budget, max_budget),
                city_id = COALESCE(:city_id, city_id),
                city_custom = COALESCE(:city_custom, city_custom),
                location = COALESCE(:location, location),
                duration = COALESCE(:duration, duration),
                visibility_status = COALESCE(:visibility_status, visibility_status),
                updated_at = NOW()
            WHERE id = :id AND user_id = :user_id
            RETURNING *
        """),
        {
            "id": event_id,
            "user_id": user_id,
            "name": payload.name,
            "description": payload.description,
            "event_date": payload.event_date,
            "guest_count": payload.guest_count,
            "max_budget": payload.max_budget,
            "city_id": payload.city_id,
            "city_custom": payload.city_custom,
            "location": payload.location,
            "duration": payload.duration,
            "visibility_status": payload.visibility_status,
        }
    ).fetchone()

    db.commit()
    return get_event_detail(event_id, db)


def update_event_status(event_id: str, user_id: str, new_status: str, db: Session) -> dict:
    event = _verify_ownership(event_id, user_id, db)
    validate_event_not_finalized(event["status"])
    validate_status_transition(event["status"], new_status)

    updated = db.execute(
        text("""
            UPDATE events
            SET status = :status, updated_at = NOW()
            WHERE id = :id AND user_id = :user_id
            RETURNING *
        """),
        {"id": event_id, "user_id": user_id, "status": new_status}
    ).fetchone()

    db.execute(
        text("""
            INSERT INTO event_history (event_id, previous_status, new_status, changed_by)
            VALUES (:event_id, :previous_status, :new_status, :changed_by)
        """),
        {
            "event_id": event_id,
            "previous_status": event["status"],
            "new_status": new_status,
            "changed_by": user_id,
        }
    )

    db.commit()
    return get_event_detail(event_id, db)


def list_user_events(user_id: str, status: str | None, db: Session) -> list:
    query = """
        SELECT e.id, e.user_id, e.name, e.description, e.event_date,
            e.guest_count, e.max_budget, e.template_id, e.user_template_id,
            e.city_id, e.city_custom, c.name AS city_name, e.event_type_id, et.name AS event_type_name,
            e.location, e.duration,
            e.status, e.visibility_status, e.created_at, e.updated_at,
            COALESCE(g.confirmed_count, 0) AS confirmed_guests_count,
            COALESCE(b.total, 0) AS total_estimated,
            COALESCE(bg.total, 0) AS total_gastado
        FROM events e
        LEFT JOIN event_types et ON et.id = e.event_type_id
        LEFT JOIN cities c ON c.id = e.city_id
        LEFT JOIN (
            SELECT event_id, COUNT(*) AS confirmed_count
            FROM guests WHERE confirmed = true GROUP BY event_id
        ) g ON g.event_id = e.id
        LEFT JOIN (
            SELECT event_id, SUM(quantity * unit_price) AS total
            FROM event_items GROUP BY event_id
        ) b ON b.event_id = e.id
        LEFT JOIN (
            SELECT event_id, SUM(quantity * unit_price) AS total
            FROM event_items WHERE confirmed = true GROUP BY event_id
        ) bg ON bg.event_id = e.id
        WHERE e.user_id = :user_id
    """
    params = {"user_id": user_id}

    if status is not None:
        query += " AND e.status = :status"
        params["status"] = status

    query += " ORDER BY e.created_at DESC"

    rows = db.execute(text(query), params).fetchall()
    result = []
    for row in rows:
        event = dict(row._mapping)
        event = auto_transition_event_status(event, db)
        result.append(event)
    return result


def get_event_history(event_id: str, user_id: str, db: Session) -> list:
    event_res = db.execute(
        text("SELECT user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if str(event_res[0]) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes acceso a este evento")

    rows = db.execute(
        text("SELECT * FROM event_history WHERE event_id = :event_id ORDER BY changed_at DESC"),
        {"event_id": event_id}
    ).fetchall()
    return [dict(row._mapping) for row in rows]


def delete_event(event_id: str, user_id: str, db: Session) -> None:
    event = _verify_ownership(event_id, user_id, db)
    validate_event_is_draft(event["status"])

    db.execute(
        text("DELETE FROM events WHERE id = :id AND user_id = :user_id"),
        {"id": event_id, "user_id": user_id}
    )
    db.commit()

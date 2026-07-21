from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.event_item import EventItemCreate, EventItemUpdate
from app.services.event_service import get_event_detail


def _verify_item_ownership(item_id: str, event_id: str, db: Session) -> None:
    item_res = db.execute(
        text("SELECT event_id FROM event_items WHERE id = :id"),
        {"id": item_id}
    ).fetchone()
    if not item_res:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    if str(item_res[0]) != str(event_id):
        raise HTTPException(status_code=403, detail="El item no pertenece a este evento")


def create_event_item(event_id: str, user_id: str, payload: EventItemCreate, db: Session) -> dict:
    event_res = db.execute(
        text("SELECT user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if str(event_res[0]) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")

    result = db.execute(
        text("""
            INSERT INTO event_items (event_id, name, quantity, unit_price, notes, confirmed)
            VALUES (:event_id, :name, :quantity, :unit_price, :notes, false)
            RETURNING id, event_id, provider_id, provider_name, category_name, name, unit, quantity, unit_price, confirmed, notes
        """),
        {
            "event_id": event_id,
            "name": payload.name,
            "quantity": payload.quantity,
            "unit_price": payload.unit_price,
            "notes": payload.notes,
        }
    ).fetchone()

    if not result:
        raise HTTPException(status_code=400, detail="Failed to create event item in database")

    db.commit()
    return get_event_detail(event_id, db)


def update_event_item(event_id: str, item_id: str, user_id: str, payload: EventItemUpdate, db: Session) -> dict:
    event_res = db.execute(
        text("SELECT user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if str(event_res[0]) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")

    _verify_item_ownership(item_id, event_id, db)

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return get_event_detail(event_id, db)

    set_clause = ", ".join(f"{field} = :{field}" for field in update_data)
    params = {"id": item_id, "event_id": event_id, **update_data}

    result = db.execute(
        text(f"""
            UPDATE event_items
            SET {set_clause}
            WHERE id = :id AND event_id = :event_id
            RETURNING id, event_id, provider_id, provider_name, category_name, name, unit, quantity, unit_price, confirmed, notes
        """),
        params
    ).fetchone()

    if not result:
        raise HTTPException(status_code=400, detail="Failed to update event item in database")

    db.commit()
    return get_event_detail(event_id, db)


def delete_event_item(event_id: str, item_id: str, user_id: str, db: Session) -> dict:
    event_res = db.execute(
        text("SELECT user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if str(event_res[0]) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")

    _verify_item_ownership(item_id, event_id, db)

    db.execute(
        text("DELETE FROM event_items WHERE id = :id AND event_id = :event_id"),
        {"id": item_id, "event_id": event_id}
    )
    db.commit()
    return get_event_detail(event_id, db)

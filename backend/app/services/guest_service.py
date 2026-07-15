from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.guest import GuestCreate, GuestUpdate
from app.services.event_service import validate_event_not_finalized

def sync_guest_count_if_exceeded(event_id: str, db: Session) -> None:
    """
    Counts the number of guests in the event.
    If it exceeds the current event's guest_count, updates guest_count to equal the new total.
    """
    total_guests = db.execute(
        text("SELECT COUNT(*) FROM guests WHERE event_id = :event_id"),
        {"event_id": event_id}
    ).scalar() or 0
    
    event_res = db.execute(
        text("SELECT guest_count FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    
    if event_res:
        current_guest_count = event_res[0] or 0
        if total_guests > current_guest_count:
            db.execute(
                text("UPDATE events SET guest_count = :guest_count, updated_at = NOW() WHERE id = :id"),
                {"guest_count": total_guests, "id": event_id}
            )

def get_guests_by_event(event_id: str, user_id: str, db: Session) -> list:
    """
    Fetches the list of guests associated with the event after verifying ownership.
    """
    event_res = db.execute(
        text("SELECT user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
        
    if str(event_res[0]) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")
        
    guests_res = db.execute(
        text("SELECT * FROM guests WHERE event_id = :event_id ORDER BY created_at ASC"),
        {"event_id": event_id}
    ).fetchall()
    
    return [dict(g._mapping) for g in guests_res] if guests_res else []

def create_guest(event_id: str, user_id: str, payload: GuestCreate, db: Session) -> dict:
    """
    Creates a new guest under the specified event after verifying ownership and status.
    Auto-syncs guest_count if it exceeds the planned limit.
    """
    event_res = db.execute(
        text("SELECT status, guest_count, user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
        
    if str(event_res.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")
        
    validate_event_not_finalized(event_res.status)
    
    insert_res = db.execute(
        text("""
            INSERT INTO guests (event_id, full_name, confirmed, notes)
            VALUES (:event_id, :full_name, :confirmed, :notes)
            RETURNING *
        """),
        {
            "event_id": event_id,
            "full_name": payload.full_name,
            "confirmed": payload.confirmed,
            "notes": payload.notes
        }
    ).fetchone()
    
    if not insert_res:
        raise HTTPException(status_code=400, detail="Error al crear el invitado")
        
    guest = dict(insert_res._mapping)
    
    # Check if the guest list count exceeds current capacity
    sync_guest_count_if_exceeded(event_id, db)
    
    db.commit()
    return guest

def update_guest(event_id: str, guest_id: str, user_id: str, payload: GuestUpdate, db: Session) -> dict:
    """
    Updates an existing guest record after verifying event ownership, event status, and guest existence.
    """
    event_res = db.execute(
        text("SELECT status, user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
        
    if str(event_res.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")
        
    validate_event_not_finalized(event_res.status)
    
    guest_check = db.execute(
        text("SELECT id FROM guests WHERE id = :id AND event_id = :event_id"),
        {"id": guest_id, "event_id": event_id}
    ).fetchone()
    
    if not guest_check:
        raise HTTPException(status_code=404, detail="Invitado no encontrado")
        
    update_res = db.execute(
        text("""
            UPDATE guests
            SET full_name = COALESCE(:full_name, full_name),
                confirmed = COALESCE(:confirmed, confirmed),
                notes = COALESCE(:notes, notes),
                updated_at = NOW()
            WHERE id = :id AND event_id = :event_id
            RETURNING *
        """),
        {
            "id": guest_id,
            "event_id": event_id,
            "full_name": payload.full_name,
            "confirmed": payload.confirmed,
            "notes": payload.notes
        }
    ).fetchone()
    
    if not update_res:
        raise HTTPException(status_code=400, detail="Error al actualizar el invitado")
        
    guest = dict(update_res._mapping)
    db.commit()
    return guest

def delete_guest(event_id: str, guest_id: str, user_id: str, db: Session) -> None:
    """
    Deletes a guest from the event after verifying ownership, status, and guest existence.
    """
    event_res = db.execute(
        text("SELECT status, user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    
    if not event_res:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
        
    if str(event_res.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")
        
    validate_event_not_finalized(event_res.status)
    
    guest_check = db.execute(
        text("SELECT id FROM guests WHERE id = :id AND event_id = :event_id"),
        {"id": guest_id, "event_id": event_id}
    ).fetchone()
    
    if not guest_check:
        raise HTTPException(status_code=404, detail="Invitado no encontrado")
        
    db.execute(
        text("DELETE FROM guests WHERE id = :id AND event_id = :event_id"),
        {"id": guest_id, "event_id": event_id}
    )
    db.commit()

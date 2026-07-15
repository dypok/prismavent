from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.event_item import EventItemCreate, EventItemResponse, EventItemUpdate
from app.dependencies import get_current_user

router = APIRouter(prefix="/events", tags=["event_items"])

@router.post("/{event_id}/items", response_model=EventItemResponse)
def create_event_item(
    event_id: str,
    payload: EventItemCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new event item associated with the event after verifying ownership.
    """
    try:
        # 1. Fetch event details first by id to check existence
        event_res = db.execute(
            text("SELECT user_id FROM events WHERE id = :id"),
            {"id": event_id}
        ).fetchone()
        
        if not event_res:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
            
        event = event_res._mapping
        if str(event["user_id"]) != str(current_user.id):
            raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")
            
        # 2. Insert event item record (confirmed always starts in False)
        insert_query = text("""
            INSERT INTO event_items (
                event_id, name, quantity, unit_price, notes, confirmed
            ) VALUES (
                :event_id, :name, :quantity, :unit_price, :notes, false
            ) RETURNING id, event_id, provider_id, provider_name, category_name, name, unit, quantity, unit_price, confirmed, notes
        """)
        
        item_params = {
            "event_id": event_id,
            "name": payload.name,
            "quantity": payload.quantity,
            "unit_price": payload.unit_price,
            "notes": payload.notes
        }
        
        result = db.execute(insert_query, item_params).fetchone()
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create event item in database")
            
        created_item = dict(result._mapping)
        created_item["id"] = str(created_item["id"])
        created_item["event_id"] = str(created_item["event_id"])
        
        db.commit()
        return created_item
        
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error creating event item: {str(e)}")

@router.patch("/{event_id}/items/{item_id}", response_model=EventItemResponse)
def update_event_item(
    event_id: str,
    item_id: str,
    payload: EventItemUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates an existing event item details after verifying event ownership, event existence, and item existence.
    """
    try:
        # 1. Fetch event details first by id to check existence
        event_res = db.execute(
            text("SELECT user_id FROM events WHERE id = :id"),
            {"id": event_id}
        ).fetchone()
        
        if not event_res:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
            
        event = event_res._mapping
        if str(event["user_id"]) != str(current_user.id):
            raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")
            
        # 2. Fetch event item details first by id to check existence
        item_res = db.execute(
            text("SELECT event_id FROM event_items WHERE id = :id"),
            {"id": item_id}
        ).fetchone()
        
        if not item_res:
            raise HTTPException(status_code=404, detail="Item no encontrado")
            
        # 3. Verify item belongs to the event
        if str(item_res[0]) != str(event_id):
            raise HTTPException(status_code=403, detail="El item no pertenece a este evento")
            
        # 4. Perform dynamic update for provided fields
        update_fields = []
        params = {"id": item_id, "event_id": event_id}
        
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            update_fields.append(f"{field} = :{field}")
            params[field] = value
            
        if update_fields:
            query_str = f"""
                UPDATE event_items
                SET {", ".join(update_fields)}
                WHERE id = :id AND event_id = :event_id
                RETURNING id, event_id, provider_id, provider_name, category_name, name, unit, quantity, unit_price, confirmed, notes
            """
            result = db.execute(text(query_str), params).fetchone()
        else:
            result = db.execute(
                text("SELECT id, event_id, provider_id, provider_name, category_name, name, unit, quantity, unit_price, confirmed, notes FROM event_items WHERE id = :id AND event_id = :event_id"),
                {"id": item_id, "event_id": event_id}
            ).fetchone()
            
        if not result:
            raise HTTPException(status_code=400, detail="Failed to update event item in database")
            
        updated_item = dict(result._mapping)
        updated_item["id"] = str(updated_item["id"])
        updated_item["event_id"] = str(updated_item["event_id"])
        
        db.commit()
        return updated_item
        
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error updating event item: {str(e)}")

@router.delete("/{event_id}/items/{item_id}")
def delete_event_item(
    event_id: str,
    item_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes an event item after verifying event ownership, event existence, and item existence.
    """
    try:
        # 1. Fetch event details first by id to check existence
        event_res = db.execute(
            text("SELECT user_id FROM events WHERE id = :id"),
            {"id": event_id}
        ).fetchone()
        
        if not event_res:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
            
        event = event_res._mapping
        if str(event["user_id"]) != str(current_user.id):
            raise HTTPException(status_code=403, detail="No tienes permiso para acceder a este evento")
            
        # 2. Fetch event item details first by id to check existence
        item_res = db.execute(
            text("SELECT event_id FROM event_items WHERE id = :id"),
            {"id": item_id}
        ).fetchone()
        
        if not item_res:
            raise HTTPException(status_code=404, detail="Item no encontrado")
            
        # 3. Verify item belongs to the event
        if str(item_res[0]) != str(event_id):
            raise HTTPException(status_code=403, detail="El item no pertenece a este evento")
            
        # 4. Perform deletion
        db.execute(
            text("DELETE FROM event_items WHERE id = :id AND event_id = :event_id"),
            {"id": item_id, "event_id": event_id}
        )
        
        db.commit()
        return {"message": "Recurso eliminado exitosamente"}
        
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error deleting event item: {str(e)}")

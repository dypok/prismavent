from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.event import EventCreate, EventResponse, EventDetailResponse, EventDetailOut, EventUpdate
from app.core.supabase import get_supabase_client_for_user
from app.dependencies import get_current_user
from app.services import budget_service
from app.services.event_service import (
    validate_event_not_finalized,
    validate_event_date_not_past,
    validate_guest_count_editable,
    validate_event_is_draft
)
from typing import List

router = APIRouter(prefix="/events", tags=["events"])

@router.post("", response_model=EventResponse)
def create_event(payload: EventCreate, request: Request, db: Session = Depends(get_db)):
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found in request state")
    
    user_id = user.id
    
    try:
        # 1. Fetch template items if template_id or user_template_id is provided
        default_items = []
        if payload.template_id:
            temp_res = db.execute(
                text("SELECT default_items FROM templates WHERE id = :id"),
                {"id": payload.template_id}
            ).fetchone()
            if temp_res:
                default_items = temp_res[0] or []
        elif payload.user_template_id:
            temp_res = db.execute(
                text("SELECT items FROM user_templates WHERE id = :id"),
                {"id": payload.user_template_id}
            ).fetchone()
            if temp_res:
                default_items = temp_res[0] or []

        # 2. Insert event record
        insert_query = text("""
            INSERT INTO events (
                user_id, name, description, event_date, guest_count, max_budget,
                template_id, user_template_id, city_id, city_custom, event_type_id,
                location, status, visibility_status
            ) VALUES (
                :user_id, :name, :description, :event_date, :guest_count, :max_budget,
                :template_id, :user_template_id, :city_id, :city_custom, :event_type_id,
                :location, :status, :visibility_status
            ) RETURNING id, user_id, city_id, city_custom, event_type_id, template_id, user_template_id, name, description, location, event_date, guest_count, max_budget, status, visibility_status, created_at, updated_at
        """)
        
        event_params = {
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
            "status": "borrador", # Esto dejenlo como borrador >:(
            "visibility_status": payload.visibility_status
        }
        
        result = db.execute(insert_query, event_params).fetchone()
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create event in database")
            
        created_event = dict(result._mapping)
        event_id = created_event["id"]
        
        # 3. Clone template items into event_items
        if default_items:
            insert_item_query = text("""
                INSERT INTO event_items (
                    event_id, name, quantity, unit_price, confirmed
                ) VALUES (
                    :event_id, :name, :quantity, :unit_price, :confirmed
                )
            """)
            
            for item in default_items:
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
                    
                db.execute(insert_item_query, {
                    "event_id": event_id,
                    "name": item.get("name", "Item sin nombre"),
                    "quantity": quantity,
                    "unit_price": price,
                    "confirmed": False
                })
                
        # 4. Commit all changes inside the transaction
        db.commit()
        return created_event
        
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error creating event: {str(e)}")

@router.get("/{event_id}", response_model=EventDetailOut)
def get_event(event_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        # Fetch event details validating user ownership
        event_res = db.execute(
            text("SELECT * FROM events WHERE id = :id AND user_id = :user_id"),
            {"id": event_id, "user_id": current_user.id}
        ).fetchone()
        
        if not event_res:
            raise HTTPException(status_code=404, detail="Event not found")
            
        return map_event_to_detail(event_res._mapping, db)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error retrieving event details: {str(e)}")


def map_event_to_detail(event_data: dict, db: Session) -> dict:
    event = dict(event_data)
    event_id = str(event["id"])
    
    # 1. Fetch associated event items
    items_res = db.execute(
        text("SELECT * FROM event_items WHERE event_id = :event_id"),
        {"event_id": event_id}
    ).fetchall()
    
    event_items = [dict(item._mapping) for item in items_res] if items_res else []
    
    # 2. Fetch associated guests
    guests_res = db.execute(
        text("SELECT * FROM guests WHERE event_id = :event_id ORDER BY created_at ASC"),
        {"event_id": event_id}
    ).fetchall()
    
    guests = [dict(g._mapping) for g in guests_res] if guests_res else []
    
    # 3. Calculate budget metrics
    total_estimated = budget_service.calculate_total_estimated(event_items)
    budget_alert = budget_service.check_budget_alert(total_estimated, event.get("max_budget"))
    
    # 4. Calculate guest counters
    registered_guests_count = len(guests)
    confirmed_guests_count = sum(1 for g in guests if g["confirmed"])
    unconfirmed_guests_count = registered_guests_count - confirmed_guests_count
    
    # 5. Populate response dictionary
    event["event_items"] = event_items
    event["guests"] = guests
    event["registered_guests_count"] = registered_guests_count
    event["confirmed_guests_count"] = confirmed_guests_count
    event["unconfirmed_guests_count"] = unconfirmed_guests_count
    event["total_estimated"] = total_estimated
    event["budget_alert"] = budget_alert
    
    return event


@router.patch("/{event_id}", response_model=EventDetailOut)
def update_event(
    event_id: str,
    payload: EventUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Fetch event details validating user ownership
        event_res = db.execute(
            text("SELECT * FROM events WHERE id = :id AND user_id = :user_id"),
            {"id": event_id, "user_id": current_user.id}
        ).fetchone()

        if event_res is None:
            raise HTTPException(status_code=404, detail="Evento no encontrado")

        event = event_res._mapping
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
                    visibility_status = COALESCE(:visibility_status, visibility_status),
                    updated_at = NOW()
                WHERE id = :id AND user_id = :user_id
                RETURNING *
            """),
            {
                "id": event_id,
                "user_id": current_user.id,
                "name": payload.name,
                "description": payload.description,
                "event_date": payload.event_date,
                "guest_count": payload.guest_count,
                "max_budget": payload.max_budget,
                "city_id": payload.city_id,
                "city_custom": payload.city_custom,
                "location": payload.location,
                "visibility_status": payload.visibility_status,
            }
        ).fetchone()
        
        db.commit()
        return map_event_to_detail(updated._mapping, db)
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error updating event: {str(e)}")
    
# ==================== NUEVO: LISTAR EVENTOS DEL USUARIO ====================
@router.get("", response_model=List[EventResponse])
def get_events(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obtener todos los eventos del usuario actual"""
    try:
        events = db.execute(
            text("""
                SELECT id, user_id, name, description, event_date, guest_count, 
                    max_budget, template_id, user_template_id, city_id, 
                    city_custom, event_type_id, location, status, 
                    visibility_status, created_at, updated_at
                FROM events 
                WHERE user_id = :user_id 
                ORDER BY created_at DESC
            """),
            {"user_id": current_user.id}
        ).fetchall()

        return [dict(event._mapping) for event in events]
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving events: {str(e)}")

@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes an event if its status is 'borrador' and the event belongs to the authenticated user.
    """
    try:
        # Fetch event details validating user ownership and status
        event_res = db.execute(
            text("SELECT status FROM events WHERE id = :id AND user_id = :user_id"),
            {"id": event_id, "user_id": current_user.id}
        ).fetchone()
        
        if not event_res:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
            
        event = event_res._mapping
        validate_event_is_draft(event["status"])
        
        db.execute(
            text("DELETE FROM events WHERE id = :id AND user_id = :user_id"),
            {"id": event_id, "user_id": current_user.id}
        )
        db.commit()
        
        return {"message": "Evento eliminado exitosamente"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error deleting event: {str(e)}")

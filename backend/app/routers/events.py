from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.event import EventCreate, EventResponse, EventDetailResponse, EventDetailOut
from app.core.supabase import get_supabase_client_for_user
from app.dependencies import get_current_user
from app.services import budget_service
from typing import List

router = APIRouter(prefix="/events", tags=["events"])

@router.post("", response_model=EventResponse)
def create_event(payload: EventCreate, request: Request, db: Session = Depends(get_db)):
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found in request state")
    
    user_id = user.id
    # supabase_client = get_supabase_client_for_user(request.state.token)
    
    # # 1. Prepare event data
    # event_data = {
    #     "user_id": user_id,
    #     "name": payload.name,
    #     "description": payload.description,
    #     "event_date": payload.event_date.isoformat(), #para que antes de mandarlo se haga string de nuevo :P
    #     "guest_count": payload.guest_count,
    #     "max_budget": float(payload.max_budget) if payload.max_budget is not None else None,
    #     "template_id": payload.template_id,
    #     "user_template_id": payload.user_template_id,
    #     "city_id": payload.city_id,
    #     "city_custom": payload.city_custom,
    #     "event_type_id": payload.event_type_id,
    #     "location": payload.location,
    #     "status": "borrador",# fijamos borrador aqui :p
    #     "visibility_status": payload.visibility_status,
    # }
    
    # # Remove None values so database defaults apply
    # event_data = {k: v for k, v in event_data.items() if v is not None}
    
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
            "status": "borrador", #Esto dejenlo como borrador >:(
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
            
        event = dict(event_res._mapping)
        
        # Fetch associated event items
        items_res = db.execute(
            text("SELECT * FROM event_items WHERE event_id = :event_id"),
            {"event_id": event_id}
        ).fetchall()
        
        event_items = [dict(item._mapping) for item in items_res] if items_res else []
        
        # Calculate budget metrics
        total_estimated = budget_service.calculate_total_estimated(event_items)
        budget_alert = budget_service.check_budget_alert(total_estimated, event.get("max_budget"))
        
        # Populate response dictionary
        event["event_items"] = event_items
        event["total_estimated"] = total_estimated
        event["budget_alert"] = budget_alert
        
        return event
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error retrieving event details: {str(e)}")

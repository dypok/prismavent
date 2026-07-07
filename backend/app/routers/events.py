from fastapi import APIRouter, HTTPException, Request
from app.core.supabase import get_supabase_client
from app.schemas.events import EventCreate, EventResponse, EventDetailResponse
from typing import List

router = APIRouter(prefix="/events", tags=["events"])

@router.post("", response_model=EventResponse)
def create_event(payload: EventCreate, request: Request):
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found in request state")
    
    user_id = user.id
    supabase_client = get_supabase_client()
    
    # 1. Prepare event data
    event_data = {
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
        "status": payload.status,
        "visibility_status": payload.visibility_status,
    }
    
    # Remove None values so database defaults apply
    event_data = {k: v for k, v in event_data.items() if v is not None}
    
    try:
        # 2. Insert event
        result = supabase_client.table("events").insert(event_data).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create event in database")
        
        created_event = result.data[0]
        event_id = created_event["id"]
        
        # 3. Clone template items if applicable
        default_items = []
        
        if payload.template_id:
            # Fetch default items from templates
            temp_res = supabase_client.table("templates").select("default_items").eq("id", payload.template_id).execute()
            if temp_res.data:
                default_items = temp_res.data[0].get("default_items", [])
        
        elif payload.user_template_id:
            # Fetch default items from user templates
            temp_res = supabase_client.table("user_templates").select("items").eq("id", payload.user_template_id).execute()
            if temp_res.data:
                default_items = temp_res.data[0].get("items", [])
                
        # 4. Insert cloned items into event_items
        if default_items:
            event_items_to_insert = []
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
                    
                event_items_to_insert.append({
                    "event_id": event_id,
                    "name": item.get("name", "Item sin nombre"),
                    "quantity": quantity,
                    "unit_price": price,
                    "confirmed": False
                })
            
            if event_items_to_insert:
                supabase_client.table("event_items").insert(event_items_to_insert).execute()
                
        return created_event
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating event: {str(e)}")

@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event(event_id: str, request: Request):
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found in request state")
        
    user_id = user.id
    supabase_client = get_supabase_client()
    
    try:
        # Fetch event details
        event_res = supabase_client.table("events").select("*").eq("id", event_id).eq("user_id", user_id).execute()
        if not event_res.data:
            raise HTTPException(status_code=404, detail="Event not found")
            
        event = event_res.data[0]
        
        # Fetch event items
        items_res = supabase_client.table("event_items").select("*").eq("event_id", event_id).execute()
        event["items"] = items_res.data if items_res.data else []
        
        return event
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"Error retrieving event details: {str(e)}")

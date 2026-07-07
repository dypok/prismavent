from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    event_date: str  # YYYY-MM-DD
    guest_count: Optional[int] = 0
    max_budget: Optional[Decimal] = None
    template_id: Optional[str] = None
    user_template_id: Optional[str] = None
    city_id: Optional[str] = None
    city_custom: Optional[str] = None
    event_type_id: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "borrador"
    visibility_status: Optional[str] = "active"

class EventResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    event_date: str
    guest_count: int
    max_budget: Optional[Decimal] = None
    template_id: Optional[str] = None
    user_template_id: Optional[str] = None
    city_id: Optional[str] = None
    city_custom: Optional[str] = None
    event_type_id: Optional[str] = None
    location: Optional[str] = None
    status: str
    visibility_status: str
    created_at: str
    updated_at: str

class EventItemResponse(BaseModel):
    id: str
    event_id: str
    provider_id: Optional[str] = None
    provider_name: Optional[str] = None
    category_name: Optional[str] = None
    name: str
    unit: Optional[str] = None
    quantity: int
    unit_price: Decimal
    confirmed: bool
    notes: Optional[str] = None

class EventDetailResponse(EventResponse):
    items: list[EventItemResponse] = []

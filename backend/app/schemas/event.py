from pydantic import BaseModel, field_validator, Field
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from uuid import UUID
from app.schemas.event_item import EventItemOut

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    event_date: date  # YYYY-MM-DD
    guest_count: Optional[int] = 0
    max_budget: Optional[Decimal] = None
    template_id: Optional[str] = None
    user_template_id: Optional[str] = None
    city_id: Optional[str] = None
    city_custom: Optional[str] = None
    event_type_id: Optional[str] = None
    location: Optional[str] = None
    visibility_status: Optional[str] = "active"

    @field_validator("event_date")
    @classmethod
    def event_date_must_be_future(cls, value: date) -> date:
        if value <= date.today():
            raise ValueError("event_date debe ser una fecha futura (posterior a hoy)")
        return value

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

class EventDetailResponse(EventResponse):
    items: list[str] = []

class EventWithStatsResponse(EventResponse):
    progreso: float = 0.0
    total_estimated: Decimal = Decimal("0.0")

class EventDetailOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    event_date: date
    guest_count: int
    max_budget: Optional[Decimal] = None
    template_id: Optional[UUID] = None
    user_template_id: Optional[UUID] = None
    city_id: Optional[UUID] = None
    city_custom: Optional[str] = None
    event_type_id: Optional[UUID] = None
    location: Optional[str] = None
    status: str
    visibility_status: str
    event_items: list[EventItemOut]
    total_estimated: Decimal
    budget_alert: bool
    created_at: datetime
    updated_at: datetime


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    guest_count: Optional[int] = Field(default=None, ge=0)
    max_budget: Optional[Decimal] = Field(default=None, ge=0)
    city_id: Optional[str] = None
    city_custom: Optional[str] = None
    location: Optional[str] = None
    visibility_status: Optional[str] = None

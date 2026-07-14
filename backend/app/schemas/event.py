from pydantic import BaseModel, field_validator
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from uuid import UUID
from app.schemas.event_item import EventItemResponse, EventItemOut
from app.schemas.guest import GuestResponse

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
    created_at: datetime
    updated_at: datetime

class EventDetailResponse(EventResponse):
    items: list[EventItemResponse] = []

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
    guests: list[GuestResponse] = []
    registered_guests_count: int = 0
    confirmed_guests_count: int = 0
    unconfirmed_guests_count: int = 0
    total_estimated: Decimal
    budget_alert: bool
    created_at: datetime
    updated_at: datetime


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    guest_count: Optional[int] = None
    max_budget: Optional[Decimal] = None
    city_id: Optional[UUID] = None
    city_custom: Optional[str] = None
    location: Optional[str] = None
    visibility_status: Optional[str] = None

# Estados válidos del ciclo de vida de un evento (ver event_service.py,
# formatters.js y FRONTEND_INTEGRATION_GUIDE.md, que ya asumen estos 3)
VALID_EVENT_STATUSES = {"borrador", "confirmado", "finalizado"}

STATUS_SEQUENCE = ["borrador", "confirmado", "finalizado"]

class EventStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def status_must_be_valid(cls, value: str) -> str:
        if value not in VALID_EVENT_STATUSES:
            raise ValueError(
                f"status inválido: '{value}'. Debe ser uno de: {', '.join(sorted(VALID_EVENT_STATUSES))}"
            )
        return value
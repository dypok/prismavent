from pydantic import BaseModel, field_validator
from typing import Optional
from decimal import Decimal
from datetime import date

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
    # status: Optional[str] = "borrador"--Nota: "status" lo elimino para no darle la opcion al cliente de que el usuario pueda mandarlo desde el fronend diferente a borrador :p
    visibility_status: Optional[str] = "active"

    @field_validator("event_date")
    @classmethod
    def event_date_must_be_future(cls, value: date) -> date:
        if value <= date.today():# Nota con <= puede ser el evento para el mismo dia si quieren que sea solo para dias futuros cambiar por < :p
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

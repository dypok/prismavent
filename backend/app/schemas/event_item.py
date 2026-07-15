from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from uuid import UUID

class EventItemCreate(BaseModel):
    name: str = Field(..., min_length=1)
    quantity: int = Field(..., ge=1)
    unit_price: Decimal = Field(..., ge=Decimal("0.0"))
    notes: Optional[str] = Field(None, max_length=300)

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

class EventItemOut(BaseModel):
    id: UUID
    name: str
    quantity: int
    unit_price: Decimal
    confirmed: bool
    notes: Optional[str] = None

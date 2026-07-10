from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class GuestCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Nombre completo del invitado")
    confirmed: Optional[bool] = False
    notes: Optional[str] = None

class GuestUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Nombre completo del invitado")
    confirmed: Optional[bool] = None
    notes: Optional[str] = None

class GuestResponse(BaseModel):
    id: UUID
    event_id: UUID
    full_name: str
    confirmed: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

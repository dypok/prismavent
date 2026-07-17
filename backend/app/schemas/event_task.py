from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import date, datetime

VALID_STATUSES = ["todo", "in_progress", "done"]
VALID_PRIORITIES = ["low", "medium", "high"]

class EventTaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: date

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(VALID_PRIORITIES)}")
        return v

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: date) -> date:
        if v <= date.today():
            raise ValueError("due_date must be a future date")
        return v

class EventTaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(VALID_PRIORITIES)}")
        return v

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v <= date.today():
            raise ValueError("due_date must be a future date")
        return v

class EventTaskMove(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(VALID_STATUSES)}")
        return v

class EventTaskResponse(BaseModel):
    id: UUID
    event_id: UUID
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

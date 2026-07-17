from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class UserTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    event_type_id: Optional[str] = None
    source_template_id: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None

class UserTemplateResponse(BaseModel):
    id: UUID
    user_id: UUID
    event_type_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    source_template_id: Optional[UUID] = None
    items: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime

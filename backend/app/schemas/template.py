from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class TemplateItemSchema(BaseModel):
    name: str
    quantity: int
    reference_price: Decimal

class TemplateResponse(BaseModel):
    id: str
    event_type_id: str
    name: str
    description: Optional[str] = None
    template_items: List[TemplateItemSchema] = []

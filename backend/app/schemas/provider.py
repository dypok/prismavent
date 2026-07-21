from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from uuid import UUID
from datetime import datetime

class ProviderCreate(BaseModel):
    category_id: UUID
    city_id: UUID
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = Field(None, max_length=200)
    image_url: Optional[str] = None
    reference_price: Optional[Decimal] = Field(None, ge=Decimal("0.0"))
    price_unit: Optional[str] = Field(None, max_length=30)
    rating: Optional[Decimal] = Field(None, ge=Decimal("0.0"), le=Decimal("5.0"))

class ProviderUpdate(BaseModel):
    category_id: Optional[UUID] = None
    city_id: Optional[UUID] = None
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = Field(None, max_length=200)
    image_url: Optional[str] = None
    reference_price: Optional[Decimal] = Field(None, ge=Decimal("0.0"))
    price_unit: Optional[str] = Field(None, max_length=30)
    rating: Optional[Decimal] = Field(None, ge=Decimal("0.0"), le=Decimal("5.0"))

class ProviderCategoryResponse(BaseModel):
    id: UUID
    name: str

class ProviderResponse(BaseModel):
    id: UUID
    category_id: UUID
    city_id: UUID
    city_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    image_url: Optional[str] = None
    reference_price: Optional[Decimal] = None
    price_unit: Optional[str] = None
    rating: Optional[Decimal] = None
    created_at: datetime
    can_edit: bool

class ProviderReviewResponse(BaseModel):
    id: UUID
    provider_id: UUID
    user_id: UUID
    rating: Decimal
    comment: Optional[str] = None
    created_at: datetime

class ProviderDetailResponse(ProviderResponse):
    reviews: List[ProviderReviewResponse] = []

class AdminProviderListResponse(BaseModel):
    providers: List[ProviderResponse]
    total: int
    page: int
    per_page: int
    pages: int

from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from uuid import UUID

class AdminMetricsTopProvider(BaseModel):
    id: UUID
    name: str
    category_name: str
    city_name: Optional[str] = None
    display_rating: Optional[Decimal] = None

class AdminMetricsCategoryCount(BaseModel):
    id: UUID
    name: str
    count: int

class AdminMetricsResponse(BaseModel):
    total_providers: int
    total_categories: int
    top_rated: List[AdminMetricsTopProvider]
    categories_with_counts: List[AdminMetricsCategoryCount]
    providers_without_reviews_count: int

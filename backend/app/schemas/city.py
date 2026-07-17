from pydantic import BaseModel
from uuid import UUID

class CityResponse(BaseModel):
    id: UUID
    name: str
    department: str | None = None
    country: str = "Colombia"

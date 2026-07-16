from pydantic import BaseModel
from typing import Optional

class WeatherResponse(BaseModel):
    """
    Schema for weather forecast responses.
    """
    temp: Optional[float] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    message: str

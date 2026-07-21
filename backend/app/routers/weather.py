from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.weather import WeatherResponse
from app.services import weather_service
from app.services.event_service import _verify_ownership

router = APIRouter(prefix="/events", tags=["weather"])

@router.get("/{event_id}/weather", response_model=WeatherResponse)
def get_event_weather(
    event_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> WeatherResponse:
    event = _verify_ownership(event_id, current_user.id, db)
    city = weather_service.resolve_event_city(event_id, db)
    weather_data = weather_service.get_weather_forecast(city, event["event_date"])
    return WeatherResponse(
        temp=weather_data.get("temp"),
        condition=weather_data.get("condition"),
        description=weather_data.get("description"),
        icon=weather_data.get("icon"),
        message=weather_data.get("message", "")
    )

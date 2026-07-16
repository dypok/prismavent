from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.weather import WeatherResponse
from app.services import weather_service

router = APIRouter(prefix="/events", tags=["weather"])

@router.get("/{event_id}/weather", response_model=WeatherResponse)
def get_event_weather(
    event_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> WeatherResponse:
    """
    Exposes an endpoint to retrieve the weather forecast for the event's date and city.
    Requires ownership of the event.
    """
    # 1. Fetch event to verify existence and check ownership
    event_res = db.execute(
        text("SELECT user_id, event_date FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()
    
    if not event_res:
        raise HTTPException(status_code=404, detail="Event not found")
        
    event = event_res._mapping
    
    # 2. Verify ownership
    if str(event["user_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access weather for this event"
        )
        
    # 3. Resolve city name
    city = weather_service.resolve_event_city(event_id, db)
    
    # 4. Query OpenWeatherMap via the service
    weather_data = weather_service.get_weather_forecast(city, event["event_date"])
    
    # 5. Map dictionary to WeatherResponse schema
    return WeatherResponse(
        temp=weather_data.get("temp"),
        condition=weather_data.get("condition"),
        description=weather_data.get("description"),
        icon=weather_data.get("icon"),
        message=weather_data.get("message", "")
    )

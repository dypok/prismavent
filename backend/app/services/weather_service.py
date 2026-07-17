import os
import httpx
from datetime import date, datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, Union

# Load API key from environment variables
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "").strip()

def resolve_event_city(event_id: str, db: Session) -> str:
    """
    Fetches the event by id and resolves its city name.
    If city_custom is provided, uses it.
    If city_id is provided, queries the cities table to resolve it.
    Defaults to 'Barranquilla' if neither is found.
    """
    query = text("""
        SELECT e.city_custom, c.name AS city_name
        FROM events e
        LEFT JOIN cities c ON e.city_id = c.id
        WHERE e.id = :event_id
    """)
    result = db.execute(query, {"event_id": event_id}).fetchone()
    if not result:  # noqa: SIM108
        raise HTTPException(status_code=404, detail="Event not found")
        
    city_custom, city_name = result
    if city_custom and city_custom.strip():
        return city_custom.strip()
    if city_name and city_name.strip():
        return city_name.strip()
    return "Barranquilla"

def get_weather_forecast(city: str, forecast_date: date) -> dict[str, Union[float, str, None]]:
    """
    Queries the OpenWeatherMap 5-day forecast for a specific city and date.
    Returns a dictionary matching the WeatherResponse schema.
    """
    today = date.today()  # Use server's local date as reference
    delta_days = (forecast_date - today).days
    
    if delta_days < 0:
        return {
            "temp": None,
            "condition": None,
            "description": None,
            "icon": None,
            "message": "Weather forecast is not available for past dates."
        }

    if delta_days > 7:
        return {
            "temp": None,
            "condition": None,
            "description": None,
            "icon": None,
            "message": f"Weather forecast is only available up to 7 days before the event. {delta_days} days remaining."
        }

    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=502,
            detail="Weather service is not configured (missing API key)."
        )
        
    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"
    }
    
    try:
        response = httpx.get(url, params=params, timeout=10.0)  # noqa: S113
    except httpx.RequestError as e:
        print(f"Error connecting to OpenWeatherMap: {e}")
        raise HTTPException(
            status_code=502,
            detail="Failed to connect to the external weather service."
        )
        
    if response.status_code == 401:
        raise HTTPException(
            status_code=502,
            detail="Authentication error with the weather provider. Invalid API key."
        )
    elif response.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail=f"No weather information found for city '{city}'."
        )
    elif response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="The external weather service returned an unexpected error."
        )
        
    data = response.json()
    forecast_list = data.get("list", [])
    
    best_forecast = None
    min_diff = None
    
    for f in forecast_list:
        dt = f.get("dt")
        if not dt:
            continue
        # Convert timestamp to date and datetime
        f_dt = datetime.fromtimestamp(dt, tz=timezone.utc)
        f_date = f_dt.date()
        
        if f_date == forecast_date:
            # Target the forecast closest to 12:00 PM (noon)
            diff = abs(f_dt.hour - 12)
            if best_forecast is None or diff < min_diff:
                best_forecast = f
                min_diff = diff
                
    if not best_forecast:
        return {
            "temp": None,
            "condition": None,
            "description": None,
            "icon": None,
            "message": "Weather forecast is not yet available for this date."
        }
        
    try:
        main_data = best_forecast.get("main", {})
        temp = main_data.get("temp")
        weather_array = best_forecast.get("weather", [])
        weather_info = weather_array[0] if weather_array else {}
        
        return {
            "temp": float(temp) if temp is not None else None,
            "condition": weather_info.get("main"),
            "description": weather_info.get("description"),
            "icon": weather_info.get("icon"),
            "message": "Forecast available"
        }
    except Exception as e:
        print(f"Error parsing weather response: {e}")
        raise HTTPException(
            status_code=502,
            detail="Error processing weather information received from the external provider."
        )

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

def _forecast_unavailable(message: str) -> dict:
    return {"temp": None, "condition": None, "description": None, "icon": None, "message": message}


def _parse_forecast_response(best_forecast: dict) -> dict:
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


def _fetch_forecast_from_api(city: str) -> list:
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=502, detail="Weather service is not configured (missing API key).")

    try:
        response = httpx.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            params={"q": city, "appid": OPENWEATHER_API_KEY, "units": "metric"},
            timeout=10.0
        )
    except httpx.RequestError as e:
        print(f"Error connecting to OpenWeatherMap: {e}")
        raise HTTPException(status_code=502, detail="Failed to connect to the external weather service.")

    if response.status_code == 401:
        raise HTTPException(status_code=502, detail="Authentication error with the weather provider. Invalid API key.")
    elif response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"No weather information found for city '{city}'.")
    elif response.status_code != 200:
        raise HTTPException(status_code=502, detail="The external weather service returned an unexpected error.")

    return response.json().get("list", [])


def get_weather_forecast(city: str, forecast_date: date) -> dict[str, Union[float, str, None]]:
    today = date.today()
    if isinstance(forecast_date, datetime):
        forecast_date = forecast_date.date()
    delta_days = (forecast_date - today).days

    if delta_days < 0:
        return _forecast_unavailable("Weather forecast is not available for past dates.")
    if delta_days > 7:
        return _forecast_unavailable(f"Weather forecast is only available up to 7 days before the event. {delta_days} days remaining.")

    forecast_list = _fetch_forecast_from_api(city)

    best_forecast = None
    min_diff = None
    for f in forecast_list:
        dt = f.get("dt")
        if not dt:
            continue
        f_dt = datetime.fromtimestamp(dt, tz=timezone.utc)
        if f_dt.date() == forecast_date:
            diff = abs(f_dt.hour - 12)
            if best_forecast is None or diff < min_diff:
                best_forecast = f
                min_diff = diff

    if not best_forecast:
        return _forecast_unavailable("Weather forecast is not yet available for this date.")
    return _parse_forecast_response(best_forecast)

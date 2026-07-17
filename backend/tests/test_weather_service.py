import os
import sys
import unittest
from datetime import date, timedelta
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from sqlalchemy import text

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.services.weather_service import resolve_event_city, get_weather_forecast

class TestWeatherService(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.db = SessionLocal()
        cls.city_id = "d1000000-0000-0000-0000-000000000001"  # Barranquilla UUID in dev seed
        cls.event_id_custom = "e1000000-0000-0000-0000-000000000001"
        cls.event_id_db_city = "e1000000-0000-0000-0000-000000000002"
        cls.event_id_default = "e1000000-0000-0000-0000-000000000003"
        
        try:
            # Clean up potential leftovers
            cls.db.execute(text("DELETE FROM events WHERE id IN (:e1, :e2, :e3)"), {
                "e1": cls.event_id_custom,
                "e2": cls.event_id_db_city,
                "e3": cls.event_id_default
            })
            cls.db.commit()

            # Insert test events
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, city_custom)
                VALUES (:id, '9f716fd2-e147-4211-a5c0-98e0f5143e19', 'Event Custom City', '2026-10-10', 'Medellín')
            """), {"id": cls.event_id_custom})
            
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, city_id)
                VALUES (:id, '9f716fd2-e147-4211-a5c0-98e0f5143e19', 'Event DB City', '2026-10-10', :city_id)
            """), {"id": cls.event_id_db_city, "city_id": cls.city_id})
            
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date)
                VALUES (:id, '9f716fd2-e147-4211-a5c0-98e0f5143e19', 'Event Default City', '2026-10-10')
            """), {"id": cls.event_id_default})
            
            cls.db.commit()
        except Exception as e:
            cls.db.rollback()
            raise e
        finally:
            cls.db.close()
            
    @classmethod
    def tearDownClass(cls) -> None:
        db = SessionLocal()
        try:
            db.execute(text("DELETE FROM events WHERE id IN (:e1, :e2, :e3)"), {
                "e1": cls.event_id_custom,
                "e2": cls.event_id_db_city,
                "e3": cls.event_id_default
            })
            db.commit()
        finally:
            db.close()

    def test_resolver_ciudad_evento_custom(self) -> None:
        db = SessionLocal()
        try:
            city = resolve_event_city(self.event_id_custom, db)
            self.assertEqual(city, "Medellín")
        finally:
            db.close()

    def test_resolver_ciudad_evento_db_city(self) -> None:
        db = SessionLocal()
        try:
            city = resolve_event_city(self.event_id_db_city, db)
            self.assertEqual(city, "Barranquilla")
        finally:
            db.close()

    def test_resolver_ciudad_evento_default(self) -> None:
        db = SessionLocal()
        try:
            city = resolve_event_city(self.event_id_default, db)
            self.assertEqual(city, "Barranquilla")
        finally:
            db.close()

    def test_consultar_clima_past_date(self) -> None:
        past_date = date.today() - timedelta(days=1)
        res = get_weather_forecast("Barranquilla", past_date)
        self.assertIsNone(res["temp"])
        self.assertIn("past dates", str(res["message"]))

    def test_consultar_clima_future_date_limit(self) -> None:
        future_date = date.today() + timedelta(days=8)
        res = get_weather_forecast("Barranquilla", future_date)
        self.assertIsNone(res["temp"])
        self.assertIn("up to 7 days", str(res["message"]))

    @patch("httpx.get")
    def test_consultar_clima_success(self, mock_get: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "list": [
                {
                    "dt": 1792324800,
                    "main": {"temp": 25.5},
                    "weather": [{"main": "Clouds", "description": "nubes dispersas", "icon": "03d"}]
                }
            ]
        }
        mock_get.return_value = mock_response
        
        test_date = date.today() + timedelta(days=3)
        
        from datetime import datetime, timezone
        dt_val = int(datetime(test_date.year, test_date.month, test_date.day, 12, 0, 0, tzinfo=timezone.utc).timestamp())
        mock_response.json.return_value["list"][0]["dt"] = dt_val
        
        res = get_weather_forecast("Barranquilla", test_date)
        self.assertEqual(res["temp"], 25.5)
        self.assertEqual(res["condition"], "Clouds")
        self.assertEqual(res["description"], "nubes dispersas")
        self.assertEqual(res["icon"], "03d")
        self.assertEqual(res["message"], "Forecast available")

    @patch("httpx.get")
    def test_consultar_clima_not_found(self, mock_get: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        test_date = date.today() + timedelta(days=3)
        with self.assertRaises(HTTPException) as ctx:
            get_weather_forecast("NonExistentCity", test_date)
        self.assertEqual(ctx.exception.status_code, 404)
        self.assertIn("No weather information found", ctx.exception.detail)

    @patch("httpx.get")
    def test_consultar_clima_unauthorized(self, mock_get: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_get.return_value = mock_response
        
        test_date = date.today() + timedelta(days=3)
        with self.assertRaises(HTTPException) as ctx:
            get_weather_forecast("Barranquilla", test_date)
        self.assertEqual(ctx.exception.status_code, 502)
        self.assertIn("Authentication error with the weather provider", ctx.exception.detail)

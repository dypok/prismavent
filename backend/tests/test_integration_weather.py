import os
import sys
import unittest
from datetime import date, datetime, timedelta, timezone
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import text
from unittest.mock import MagicMock, patch

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.main import app

USER_A_ID = "9f716fd2-e147-4211-a5c0-98e0f5143e19"
USER_B_ID = "3c608982-f8cb-4eaa-b439-740b3371c131"

class MockUser:
    def __init__(self, id: str) -> None:
        self.id = id

class MockAuthResponse:
    def __init__(self, user: MockUser) -> None:
        self.user = user

class TestIntegrationWeather(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.event_id_owner = str(uuid4())
        cls.event_id_other = str(uuid4())
        
        cls.db = SessionLocal()
        try:
            # Clean up potential leftovers
            cls.db.execute(text("DELETE FROM events WHERE id IN (:e1, :e2)"), {
                "e1": cls.event_id_owner,
                "e2": cls.event_id_other
            })
            cls.db.commit()

            # Insert test event owned by User A (event date in 3 days)
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, status, visibility_status)
                VALUES (:id, :user_id, 'My Weather Event', :event_date, 'borrador', 'active')
            """), {
                "id": cls.event_id_owner,
                "user_id": USER_A_ID,
                "event_date": date.today() + timedelta(days=3)
            })

            # Insert test event owned by User B (event date in 3 days)
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, status, visibility_status)
                VALUES (:id, :user_id, 'Other User Event', :event_date, 'borrador', 'active')
            """), {
                "id": cls.event_id_other,
                "user_id": USER_B_ID,
                "event_date": date.today() + timedelta(days=3)
            })
            
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
            db.execute(text("DELETE FROM events WHERE id IN (:e1, :e2)"), {
                "e1": cls.event_id_owner,
                "e2": cls.event_id_other
            })
            db.commit()
        finally:
            db.close()

    def setUp(self) -> None:
        self.current_test_user = MockUser(USER_A_ID)
        self.mock_client = MagicMock()
        self.mock_client.auth.get_user = lambda token: MockAuthResponse(self.current_test_user)
        self.patcher = patch('app.middlewares.auth_middleware.get_supabase_client', return_value=self.mock_client)
        self.patcher.start()

    def tearDown(self) -> None:
        self.patcher.stop()

    def test_get_weather_not_found(self) -> None:
        non_existent_id = str(uuid4())
        response = self.client.get(f"/events/{non_existent_id}/weather", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)
        self.assertIn("Event not found", response.json()["detail"])

    def test_get_weather_forbidden(self) -> None:
        response = self.client.get(f"/events/{self.event_id_other}/weather", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 403)
        self.assertIn("You do not have permission", response.json()["detail"])

    @patch("app.services.weather_service.httpx.get")
    def test_get_weather_success(self, mock_get: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.status_code = 200
        
        target_date = date.today() + timedelta(days=3)
        dt_val = int(datetime(target_date.year, target_date.month, target_date.day, 12, 0, 0, tzinfo=timezone.utc).timestamp())
        
        mock_response.json.return_value = {
            "list": [
                {
                    "dt": dt_val,
                    "main": {"temp": 30.2},
                    "weather": [{"main": "Clear", "description": "clear sky", "icon": "01d"}]
                }
            ]
        }
        mock_get.return_value = mock_response
        
        response = self.client.get(f"/events/{self.event_id_owner}/weather", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["temp"], 30.2)
        self.assertEqual(data["condition"], "Clear")
        self.assertEqual(data["description"], "clear sky")
        self.assertEqual(data["icon"], "01d")
        self.assertEqual(data["message"], "Forecast available")

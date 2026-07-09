import os
import sys
import unittest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import text

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal

# Mock the Supabase middleware before importing the main FastAPI app
from unittest.mock import MagicMock
import app.middlewares.auth_middleware as auth_middleware

USER_A_ID = "9f716fd2-e147-4211-a5c0-98e0f5143e19"
USER_B_ID = "3c608982-f8cb-4eaa-b439-740b3371c131"

class MockUser:
    def __init__(self, id):
        self.id = id

class MockAuthResponse:
    def __init__(self, user):
        self.user = user

current_test_user = MockUser(USER_A_ID)

mock_client = MagicMock()
mock_client.auth.get_user = lambda token: MockAuthResponse(current_test_user)
auth_middleware.get_supabase_client = lambda: mock_client

from app.main import app

class TestIntegrationEvents(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.event_id_1 = str(uuid4())
        cls.event_id_2 = str(uuid4())
        cls.event_id_3 = str(uuid4())
        
        # Setup data in DB
        cls.db = SessionLocal()
        try:
            # Insert test events
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, :name, '2026-10-10', 50, :max_budget, 'planificando', 'active')
            """), {"id": cls.event_id_1, "user_id": USER_A_ID, "name": "Event A - Over Budget", "max_budget": 100.00})

            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, :name, '2026-10-10', 50, :max_budget, 'borrador', 'active')
            """), {"id": cls.event_id_2, "user_id": USER_A_ID, "name": "Event A - Under Budget", "max_budget": 1000.00})

            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, :name, '2026-10-10', 50, :max_budget, 'confirmado', 'active')
            """), {"id": cls.event_id_3, "user_id": USER_A_ID, "name": "Event A - No Budget Limit", "max_budget": None})

            # Insert items associated with each event
            cls.db.execute(text("INSERT INTO event_items (id, event_id, name, quantity, unit_price, confirmed) VALUES (:id, :event_id, 'Item 1', 2, 30.00, true)"), {"id": str(uuid4()), "event_id": cls.event_id_1})
            cls.db.execute(text("INSERT INTO event_items (id, event_id, name, quantity, unit_price, confirmed) VALUES (:id, :event_id, 'Item 2', 1, 50.00, false)"), {"id": str(uuid4()), "event_id": cls.event_id_1})

            cls.db.execute(text("INSERT INTO event_items (id, event_id, name, quantity, unit_price, confirmed) VALUES (:id, :event_id, 'Item 3', 3, 100.00, true)"), {"id": str(uuid4()), "event_id": cls.event_id_2})

            cls.db.execute(text("INSERT INTO event_items (id, event_id, name, quantity, unit_price, confirmed) VALUES (:id, :event_id, 'Item 4', 1, 50.00, true)"), {"id": str(uuid4()), "event_id": cls.event_id_3})

            cls.db.commit()
        except Exception as e:
            cls.db.rollback()
            raise e
        finally:
            cls.db.close()

    @classmethod
    def tearDownClass(cls):
        db = SessionLocal()
        try:
            db.execute(text("DELETE FROM event_items WHERE event_id IN (:e1, :e2, :e3)"), {"e1": cls.event_id_1, "e2": cls.event_id_2, "e3": cls.event_id_3})
            db.execute(text("DELETE FROM events WHERE id IN (:e1, :e2, :e3)"), {"e1": cls.event_id_1, "e2": cls.event_id_2, "e3": cls.event_id_3})
            db.commit()
        finally:
            db.close()

    def test_get_event_over_budget(self):
        """TC-01: Event exceeds budget limit, alert should be True."""
        global current_test_user
        current_test_user = MockUser(USER_A_ID)
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(float(data["total_estimated"]), 110.0)
        self.assertTrue(data["budget_alert"])

    def test_get_event_under_budget(self):
        """TC-02: Event is under budget limit, alert should be False."""
        global current_test_user
        current_test_user = MockUser(USER_A_ID)
        response = self.client.get(f"/events/{self.event_id_2}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(float(data["total_estimated"]), 300.0)
        self.assertFalse(data["budget_alert"])

    def test_get_event_no_budget_limit(self):
        """TC-03: Event has no budget limit (max_budget is None), alert should be False."""
        global current_test_user
        current_test_user = MockUser(USER_A_ID)
        response = self.client.get(f"/events/{self.event_id_3}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(float(data["total_estimated"]), 50.0)
        self.assertFalse(data["budget_alert"])

    def test_get_event_unauthorized_access(self):
        """TC-04: Unauthorized user trying to access other user's event should get 404."""
        global current_test_user
        current_test_user = MockUser(USER_B_ID)
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()

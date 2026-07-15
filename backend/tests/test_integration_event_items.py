import os
import sys
import unittest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import text
from unittest.mock import MagicMock, patch

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal

USER_A_ID = "9f716fd2-e147-4211-a5c0-98e0f5143e19"
USER_B_ID = "3c608982-f8cb-4eaa-b439-740b3371c131"

class MockUser:
    def __init__(self, id):
        self.id = id

class MockAuthResponse:
    def __init__(self, user):
        self.user = user

from app.main import app

class TestIntegrationEventItems(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.event_id_1 = str(uuid4())
        
        # Setup data in DB
        cls.db = SessionLocal()
        try:
            # Insert test event owned by USER_A
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, 'Event A - Items Test', '2026-10-10', 50, 1000.00, 'borrador', 'active')
            """), {"id": cls.event_id_1, "user_id": USER_A_ID})
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
            db.execute(text("DELETE FROM event_items WHERE event_id = :e1"), {"e1": cls.event_id_1})
            db.execute(text("DELETE FROM events WHERE id = :e1"), {"e1": cls.event_id_1})
            db.commit()
        finally:
            db.close()

    def setUp(self):
        self.current_test_user = MockUser(USER_A_ID)
        self.mock_client = MagicMock()
        self.mock_client.auth.get_user = lambda token: MockAuthResponse(self.current_test_user)
        self.patcher = patch('app.middlewares.auth_middleware.get_supabase_client', return_value=self.mock_client)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_create_event_item_success(self):
        """POST /events/{id}/items: Successfully create a new event item and verify default confirmed = False."""
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "name": "Flores Decorativas",
            "quantity": 3,
            "unit_price": 45.50,
            "notes": "Rosas rojas y blancas para las mesas centrales"
        }
        response = self.client.post(f"/events/{self.event_id_1}/items", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Flores Decorativas")
        self.assertEqual(data["quantity"], 3)
        self.assertEqual(float(data["unit_price"]), 45.50)
        self.assertEqual(data["notes"], "Rosas rojas y blancas para las mesas centrales")
        self.assertFalse(data["confirmed"])
        self.assertEqual(data["event_id"], self.event_id_1)
        self.assertIsNotNone(data["id"])

        # Verify in DB
        db = SessionLocal()
        try:
            db_item = db.execute(text("SELECT * FROM event_items WHERE id = :id"), {"id": data["id"]}).fetchone()
            self.assertIsNotNone(db_item)
            item = db_item._mapping
            self.assertEqual(item["name"], "Flores Decorativas")
            self.assertEqual(item["quantity"], 3)
            self.assertEqual(float(item["unit_price"]), 45.50)
            self.assertFalse(item["confirmed"])
        finally:
            db.close()

    def test_create_event_item_invalid_name(self):
        """POST /events/{id}/items: Should return 422 if name is empty."""
        payload = {
            "name": "",
            "quantity": 1,
            "unit_price": 10.00
        }
        response = self.client.post(f"/events/{self.event_id_1}/items", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 422)

    def test_create_event_item_invalid_quantity(self):
        """POST /events/{id}/items: Should return 422 if quantity is less than 1."""
        payload = {
            "name": "Bebidas",
            "quantity": 0,
            "unit_price": 5.00
        }
        response = self.client.post(f"/events/{self.event_id_1}/items", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 422)

        payload["quantity"] = -2
        response = self.client.post(f"/events/{self.event_id_1}/items", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 422)

    def test_create_event_item_invalid_price(self):
        """POST /events/{id}/items: Should return 422 if unit_price is less than 0.0."""
        payload = {
            "name": "Música",
            "quantity": 1,
            "unit_price": -0.50
        }
        response = self.client.post(f"/events/{self.event_id_1}/items", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 422)

    def test_create_event_item_long_notes(self):
        """POST /events/{id}/items: Should return 422 if notes exceed 300 characters."""
        payload = {
            "name": "Luces",
            "quantity": 1,
            "unit_price": 100.00,
            "notes": "a" * 301
        }
        response = self.client.post(f"/events/{self.event_id_1}/items", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 422)

    def test_create_event_item_unauthorized(self):
        """POST /events/{id}/items: Should return 403 if USER B tries to add items to USER A's event."""
        self.current_test_user = MockUser(USER_B_ID)
        payload = {
            "name": "Intento de infiltración",
            "quantity": 1,
            "unit_price": 0.00
        }
        response = self.client.post(f"/events/{self.event_id_1}/items", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 403)

    def test_create_event_item_not_found(self):
        """POST /events/{id}/items: Should return 404 if event id does not exist."""
        payload = {
            "name": "Globos",
            "quantity": 10,
            "unit_price": 1.20
        }
        random_uuid = str(uuid4())
        response = self.client.post(f"/events/{random_uuid}/items", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()

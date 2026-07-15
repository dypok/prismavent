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
        cls.item_id_1 = str(uuid4())
        
        # Setup data in DB
        cls.db = SessionLocal()
        try:
            # Insert test event owned by USER_A
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, 'Event A - Items Test', '2026-10-10', 50, 1000.00, 'borrador', 'active')
            """), {"id": cls.event_id_1, "user_id": USER_A_ID})
            
            # Insert test event item
            cls.db.execute(text("""
                INSERT INTO event_items (id, event_id, name, quantity, unit_price, notes, confirmed)
                VALUES (:id, :event_id, 'Original Name', 5, 20.00, 'Original Notes', false)
            """), {"id": cls.item_id_1, "event_id": cls.event_id_1})
            
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

    def test_patch_event_item_success(self):
        """PATCH /events/{id}/items/{item_id}: Successfully update event item fields."""
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "name": "Updated Item Name",
            "quantity": 10,
            "unit_price": 25.99,
            "notes": "Updated item notes"
        }
        response = self.client.patch(f"/events/{self.event_id_1}/items/{self.item_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Updated Item Name")
        self.assertEqual(data["quantity"], 10)
        self.assertEqual(float(data["unit_price"]), 25.99)
        self.assertEqual(data["notes"], "Updated item notes")

        # Verify DB is updated
        db = SessionLocal()
        try:
            db_item = db.execute(text("SELECT * FROM event_items WHERE id = :id"), {"id": self.item_id_1}).fetchone()
            self.assertIsNotNone(db_item)
            item = db_item._mapping
            self.assertEqual(item["name"], "Updated Item Name")
            self.assertEqual(item["quantity"], 10)
            self.assertEqual(float(item["unit_price"]), 25.99)
            self.assertEqual(item["notes"], "Updated item notes")
        finally:
            db.close()

    def test_patch_event_item_invalid_quantity(self):
        """PATCH /events/{id}/items/{item_id}: Should return 422 if quantity < 1."""
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "quantity": 0
        }
        response = self.client.patch(f"/events/{self.event_id_1}/items/{self.item_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 422)

        payload["quantity"] = -5
        response = self.client.patch(f"/events/{self.event_id_1}/items/{self.item_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 422)

    def test_patch_event_item_invalid_price(self):
        """PATCH /events/{id}/items/{item_id}: Should return 422 if unit_price < 0.0."""
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "unit_price": -0.01
        }
        response = self.client.patch(f"/events/{self.event_id_1}/items/{self.item_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 422)

    def test_patch_event_item_unauthorized_event(self):
        """PATCH /events/{id}/items/{item_id}: Should return 403 if USER B tries to update USER A's event item."""
        self.current_test_user = MockUser(USER_B_ID)
        payload = {
            "name": "Hack Attempt"
        }
        response = self.client.patch(f"/events/{self.event_id_1}/items/{self.item_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 403)

    def test_patch_event_item_mismatched_event(self):
        """PATCH /events/{id}/items/{item_id}: Should return 403 if item does not belong to the path event."""
        # 1. Create a second event owned by USER_A
        db = SessionLocal()
        event_id_2 = str(uuid4())
        try:
            db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, 'Event A - Items Test 2', '2026-10-10', 50, 1000.00, 'borrador', 'active')
            """), {"id": event_id_2, "user_id": USER_A_ID})
            db.commit()
        finally:
            db.close()

        # 2. Try to update item_id_1 (under event_id_1) using event_id_2 in path
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "name": "Change attempt"
        }
        try:
            response = self.client.patch(f"/events/{event_id_2}/items/{self.item_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
            self.assertEqual(response.status_code, 403)
        finally:
            # Clean up event_id_2
            db = SessionLocal()
            try:
                db.execute(text("DELETE FROM events WHERE id = :id"), {"id": event_id_2})
                db.commit()
            finally:
                db.close()

    def test_patch_event_item_not_found_item(self):
        """PATCH /events/{id}/items/{item_id}: Should return 404 if item id does not exist."""
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "name": "Change attempt"
        }
        random_item_uuid = str(uuid4())
        response = self.client.patch(f"/events/{self.event_id_1}/items/{random_item_uuid}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

    def test_patch_event_item_not_found_event(self):
        """PATCH /events/{id}/items/{item_id}: Should return 404 if event id does not exist."""
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "name": "Change attempt"
        }
        random_event_uuid = str(uuid4())
        response = self.client.patch(f"/events/{random_event_uuid}/items/{self.item_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

    def test_delete_event_item_success(self):
        """DELETE /events/{id}/items/{item_id}: Successfully delete event item."""
        # 1. Insert a temporary item for deletion
        db = SessionLocal()
        temp_item_id = str(uuid4())
        try:
            db.execute(text("""
                INSERT INTO event_items (id, event_id, name, quantity, unit_price, notes, confirmed)
                VALUES (:id, :event_id, 'Temp Item', 1, 10.00, 'Notes', false)
            """), {"id": temp_item_id, "event_id": self.event_id_1})
            db.commit()
        finally:
            db.close()

        self.current_test_user = MockUser(USER_A_ID)
        response = self.client.delete(f"/events/{self.event_id_1}/items/{temp_item_id}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Recurso eliminado exitosamente")

        # Verify DB doesn't have it
        db = SessionLocal()
        try:
            db_item = db.execute(text("SELECT * FROM event_items WHERE id = :id"), {"id": temp_item_id}).fetchone()
            self.assertIsNone(db_item)
        finally:
            db.close()

    def test_delete_event_item_unauthorized(self):
        """DELETE /events/{id}/items/{item_id}: Should return 403 if USER B attempts to delete USER A's event item."""
        self.current_test_user = MockUser(USER_B_ID)
        response = self.client.delete(f"/events/{self.event_id_1}/items/{self.item_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 403)

    def test_delete_event_item_mismatched_event(self):
        """DELETE /events/{id}/items/{item_id}: Should return 403 if item does not belong to the path event."""
        # 1. Create a second event owned by USER_A
        db = SessionLocal()
        event_id_2 = str(uuid4())
        try:
            db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, 'Event A - Items Test 3', '2026-10-10', 50, 1000.00, 'borrador', 'active')
            """), {"id": event_id_2, "user_id": USER_A_ID})
            db.commit()
        finally:
            db.close()

        # 2. Try to delete item_id_1 (under event_id_1) using event_id_2 in path
        self.current_test_user = MockUser(USER_A_ID)
        try:
            response = self.client.delete(f"/events/{event_id_2}/items/{self.item_id_1}", headers={"Authorization": "Bearer test-token"})
            self.assertEqual(response.status_code, 403)
        finally:
            # Clean up event_id_2
            db = SessionLocal()
            try:
                db.execute(text("DELETE FROM events WHERE id = :id"), {"id": event_id_2})
                db.commit()
            finally:
                db.close()

    def test_delete_event_item_not_found_item(self):
        """DELETE /events/{id}/items/{item_id}: Should return 404 if item id does not exist."""
        self.current_test_user = MockUser(USER_A_ID)
        random_item_uuid = str(uuid4())
        response = self.client.delete(f"/events/{self.event_id_1}/items/{random_item_uuid}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

    def test_delete_event_item_not_found_event(self):
        """DELETE /events/{id}/items/{item_id}: Should return 404 if event id does not exist."""
        self.current_test_user = MockUser(USER_A_ID)
        random_event_uuid = str(uuid4())
        response = self.client.delete(f"/events/{random_event_uuid}/items/{self.item_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()

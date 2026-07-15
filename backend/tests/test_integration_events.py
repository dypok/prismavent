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

class TestIntegrationEvents(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.event_id_1 = str(uuid4())
        cls.event_id_2 = str(uuid4())
        cls.event_id_3 = str(uuid4())
        cls.event_id_finalized = str(uuid4())
        
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

            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, :name, '2026-10-10', 50, :max_budget, 'finalizado', 'active')
            """), {"id": cls.event_id_finalized, "user_id": USER_A_ID, "name": "Event A - Finalized", "max_budget": 500.00})

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
            db.execute(text("DELETE FROM event_history WHERE event_id IN (:e1, :e2, :e3)"), {"e1": cls.event_id_1, "e2": cls.event_id_2, "e3": cls.event_id_3})
            db.execute(text("DELETE FROM event_items WHERE event_id IN (:e1, :e2, :e3)"), {"e1": cls.event_id_1, "e2": cls.event_id_2, "e3": cls.event_id_3})
            db.execute(text("DELETE FROM events WHERE id IN (:e1, :e2, :e3, :e4)"), {"e1": cls.event_id_1, "e2": cls.event_id_2, "e3": cls.event_id_3, "e4": cls.event_id_finalized})
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

    def test_get_event_over_budget(self):
        """TC-01: Event exceeds budget limit, alert should be True."""
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(float(data["total_estimated"]), 110.0)
        self.assertTrue(data["budget_alert"])

    def test_get_event_under_budget(self):
        """TC-02: Event is under budget limit, alert should be False."""
        response = self.client.get(f"/events/{self.event_id_2}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(float(data["total_estimated"]), 300.0)
        self.assertFalse(data["budget_alert"])

    def test_get_event_no_budget_limit(self):
        """TC-03: Event has no budget limit (max_budget is None), alert should be False."""
        response = self.client.get(f"/events/{self.event_id_3}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(float(data["total_estimated"]), 50.0)
        self.assertFalse(data["budget_alert"])

    def test_get_event_unauthorized_access(self):
        """TC-04: Unauthorized user trying to access other user's event should get 404."""
        self.current_test_user = MockUser(USER_B_ID)
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

    def test_patch_event_success(self):
        """PATCH: Should successfully update name and max_budget, updating updated_at."""
        payload = {
            "name": "Event A - Updated Name",
            "max_budget": 800.00
        }
        response = self.client.patch(f"/events/{self.event_id_2}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Event A - Updated Name")
        self.assertEqual(float(data["max_budget"]), 800.0)
        self.assertIsNotNone(data["updated_at"])
        self.assertEqual(data["event_date"], "2026-10-10")

    def test_patch_event_past_date(self):
        """PATCH: Should return 400 if updating event_date to a past date."""
        payload = {
            "event_date": "2020-01-01"
        }
        response = self.client.patch(f"/events/{self.event_id_2}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("event_date no puede ser una fecha en el pasado", response.json()["detail"])

    def test_patch_event_finalized(self):
        """PATCH: Should return 400 if trying to modify a finalized event."""
        payload = {
            "name": "New Name"
        }
        response = self.client.patch(f"/events/{self.event_id_finalized}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", response.json()["detail"])

    def test_patch_event_ignore_fields(self):
        """PATCH: Should ignore fields not present in EventUpdate and successfully edit editable fields."""
        payload = {
            "name": "Another Name Change",
            "status": "finalizado",
            "template_id": "3c608982-f8cb-4eaa-b439-740b3371c131"
        }
        response = self.client.patch(f"/events/{self.event_id_2}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Another Name Change")
        self.assertEqual(data["status"], "borrador")
        self.assertNotEqual(data["template_id"], "3c608982-f8cb-4eaa-b439-740b3371c131")

    def test_patch_event_unauthorized(self):
        """PATCH: Should return 404 if User B tries to modify User A's event."""
        self.current_test_user = MockUser(USER_B_ID)
        payload = {
            "name": "Malicious Edit Attempt"
        }
        response = self.client.patch(f"/events/{self.event_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

    def test_patch_status_on_finalized_event(self):
        """PATCH /status: Should return 400 if trying to change status of a finalized event."""
        payload = {"status": "borrador"}
        response = self.client.patch(
            f"/events/{self.event_id_finalized}/status",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", response.json()["detail"])

    def test_create_guest_on_finalized_event(self):
        """POST /guests: Should return 400 if trying to add a guest to a finalized event."""
        payload = {"full_name": "Test Guest"}
        response = self.client.post(
            f"/events/{self.event_id_finalized}/guests",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", response.json()["detail"])

    def test_update_guest_on_finalized_event(self):
        """PATCH /guests/{id}: Should return 400 if trying to update a guest on a finalized event."""
        guest_id = str(uuid4())
        db = SessionLocal()
        try:
            db.execute(
                text("INSERT INTO guests (id, event_id, full_name, confirmed) VALUES (:id, :event_id, 'Guest', false)"),
                {"id": guest_id, "event_id": self.event_id_finalized}
            )
            db.commit()
        finally:
            db.close()

        payload = {"full_name": "Updated Guest"}
        response = self.client.patch(
            f"/events/{self.event_id_finalized}/guests/{guest_id}",
            json=payload,
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", response.json()["detail"])

    def test_delete_guest_on_finalized_event(self):
        """DELETE /guests/{id}: Should return 400 if trying to delete a guest on a finalized event."""
        guest_id = str(uuid4())
        db = SessionLocal()
        try:
            db.execute(
                text("INSERT INTO guests (id, event_id, full_name, confirmed) VALUES (:id, :event_id, 'Guest', false)"),
                {"id": guest_id, "event_id": self.event_id_finalized}
            )
            db.commit()
        finally:
            db.close()

        response = self.client.delete(
            f"/events/{self.event_id_finalized}/guests/{guest_id}",
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", response.json()["detail"])

    def test_status_change_creates_history_record(self):
        """PATCH /status: Should insert a row into event_history with previous_status, new_status, changed_at."""
        event_id = str(uuid4())
        db = SessionLocal()
        try:
            db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, status, visibility_status)
                VALUES (:id, :user_id, 'History Test', '2026-12-01', 10, 'borrador', 'active')
            """), {"id": event_id, "user_id": USER_A_ID})
            db.commit()
        finally:
            db.close()

        response = self.client.patch(
            f"/events/{event_id}/status",
            json={"status": "confirmado"},
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 200)

        db = SessionLocal()
        try:
            row = db.execute(
                text("SELECT * FROM event_history WHERE event_id = :event_id ORDER BY changed_at ASC"),
                {"event_id": event_id}
            ).fetchone()
            self.assertIsNotNone(row)
            self.assertEqual(row.previous_status, "borrador")
            self.assertEqual(row.new_status, "confirmado")
            self.assertEqual(str(row.event_id), event_id)
            self.assertEqual(str(row.changed_by), USER_A_ID)
            self.assertIsNotNone(row.changed_at)
        finally:
            db.close()

    def test_full_status_lifecycle_history(self):
        """PATCH /status: Two transitions should produce two history rows."""
        event_id = str(uuid4())
        db = SessionLocal()
        try:
            db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, status, visibility_status)
                VALUES (:id, :user_id, 'Lifecycle Test', '2026-12-01', 10, 'borrador', 'active')
            """), {"id": event_id, "user_id": USER_A_ID})
            db.commit()
        finally:
            db.close()

        r1 = self.client.patch(
            f"/events/{event_id}/status",
            json={"status": "confirmado"},
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(r1.status_code, 200)

        r2 = self.client.patch(
            f"/events/{event_id}/status",
            json={"status": "finalizado"},
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(r2.status_code, 200)

        db = SessionLocal()
        try:
            rows = db.execute(
                text("SELECT previous_status, new_status FROM event_history WHERE event_id = :event_id ORDER BY changed_at ASC"),
                {"event_id": event_id}
            ).fetchall()
            self.assertEqual(len(rows), 2)
            self.assertEqual(rows[0].previous_status, "borrador")
            self.assertEqual(rows[0].new_status, "confirmado")
            self.assertEqual(rows[1].previous_status, "confirmado")
            self.assertEqual(rows[1].new_status, "finalizado")
        finally:
            db.close()

    def test_delete_event_item_success(self):
        """DELETE /items/{id}: Should delete the item and return 200."""
        item_id = str(uuid4())
        db = SessionLocal()
        try:
            db.execute(
                text("INSERT INTO event_items (id, event_id, name, quantity, unit_price, confirmed) VALUES (:id, :event_id, 'ToDelete', 1, 10.00, false)"),
                {"id": item_id, "event_id": self.event_id_2}
            )
            db.commit()
        finally:
            db.close()

        response = self.client.delete(
            f"/events/{self.event_id_2}/items/{item_id}",
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Item eliminado exitosamente", response.json()["message"])

        db = SessionLocal()
        try:
            row = db.execute(
                text("SELECT id FROM event_items WHERE id = :id"),
                {"id": item_id}
            ).fetchone()
            self.assertIsNone(row)
        finally:
            db.close()

    def test_delete_event_item_not_found(self):
        """DELETE /items/{id}: Should return 404 if item does not exist."""
        response = self.client.delete(
            f"/events/{self.event_id_2}/items/{str(uuid4())}",
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("Item no encontrado", response.json()["detail"])

    def test_delete_event_item_wrong_event(self):
        """DELETE /items/{id}: Should return 404 if item belongs to a different event."""
        item_id = str(uuid4())
        db = SessionLocal()
        try:
            db.execute(
                text("INSERT INTO event_items (id, event_id, name, quantity, unit_price, confirmed) VALUES (:id, :event_id, 'WrongEvent', 1, 10.00, false)"),
                {"id": item_id, "event_id": self.event_id_1}
            )
            db.commit()
        finally:
            db.close()

        response = self.client.delete(
            f"/events/{self.event_id_2}/items/{item_id}",
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("Item no encontrado", response.json()["detail"])

        db = SessionLocal()
        try:
            db.execute(text("DELETE FROM event_items WHERE id = :id"), {"id": item_id})
            db.commit()
        finally:
            db.close()

    def test_delete_event_item_finalized_event(self):
        """DELETE /items/{id}: Should return 400 if event is finalized."""
        item_id = str(uuid4())
        db = SessionLocal()
        try:
            db.execute(
                text("INSERT INTO event_items (id, event_id, name, quantity, unit_price, confirmed) VALUES (:id, :event_id, 'Finalized', 1, 10.00, false)"),
                {"id": item_id, "event_id": self.event_id_finalized}
            )
            db.commit()
        finally:
            db.close()

        response = self.client.delete(
            f"/events/{self.event_id_finalized}/items/{item_id}",
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", response.json()["detail"])

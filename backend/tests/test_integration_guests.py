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

class TestIntegrationGuests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.event_id_1 = str(uuid4())
        cls.event_id_finalized = str(uuid4())
        cls.guest_id_finalized = str(uuid4())
        
        cls.db = SessionLocal()
        try:
            # Insert test events
            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, 'Event A1', '2026-10-10', 2, 1000.00, 'borrador', 'active')
            """), {"id": cls.event_id_1, "user_id": USER_A_ID})

            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, guest_count, max_budget, status, visibility_status)
                VALUES (:id, :user_id, 'Event A - Finalized', '2026-10-10', 50, 2000.00, 'finalizado', 'active')
            """), {"id": cls.event_id_finalized, "user_id": USER_A_ID})

            cls.db.execute(text("""
                INSERT INTO guests (id, event_id, full_name, confirmed, notes)
                VALUES (:id, :event_id, 'Finalized Guest', false, 'Pre-existing')
            """), {"id": cls.guest_id_finalized, "event_id": cls.event_id_finalized})

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
            db.execute(text("DELETE FROM guests WHERE event_id IN (:e1, :e2)"), {"e1": cls.event_id_1, "e2": cls.event_id_finalized})
            db.execute(text("DELETE FROM events WHERE id IN (:e1, :e2)"), {"e1": cls.event_id_1, "e2": cls.event_id_finalized})
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

    def test_guests_crud_flow_and_counters(self):
        """TC-01: Verifies complete CRUD flow of guests, checking that counters calculate correctly."""
        # 1. Verify initially the guest list is empty on event detail
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["registered_guests_count"], 0)
        self.assertEqual(data["confirmed_guests_count"], 0)
        self.assertEqual(data["unconfirmed_guests_count"], 0)
        self.assertEqual(len(data["guests"]), 0)

        # 2. Add a guest (unconfirmed)
        payload = {"full_name": "John Doe", "notes": "Needs table near exit"}
        response = self.client.post(f"/events/{self.event_id_1}/guests", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        guest_1 = response.json()
        self.assertEqual(guest_1["full_name"], "John Doe")
        self.assertEqual(guest_1["confirmed"], False)

        # Verify counters
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        data = response.json()
        self.assertEqual(data["registered_guests_count"], 1)
        self.assertEqual(data["confirmed_guests_count"], 0)
        self.assertEqual(data["unconfirmed_guests_count"], 1)
        self.assertEqual(data["guests"][0]["full_name"], "John Doe")

        # 3. Add second guest (confirmed)
        payload = {"full_name": "Jane Smith", "confirmed": True, "notes": "Speaker"}
        response = self.client.post(f"/events/{self.event_id_1}/guests", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        guest_2 = response.json()
        self.assertEqual(guest_2["full_name"], "Jane Smith")
        self.assertEqual(guest_2["confirmed"], True)

        # Verify counters
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        data = response.json()
        self.assertEqual(data["registered_guests_count"], 2)
        self.assertEqual(data["confirmed_guests_count"], 1)
        self.assertEqual(data["unconfirmed_guests_count"], 1)

        # 4. Edit guest 1 (mark as confirmed)
        payload = {"confirmed": True}
        response = self.client.patch(f"/events/{self.event_id_1}/guests/{guest_1['id']}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        
        # Verify counters updated
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        data = response.json()
        self.assertEqual(data["registered_guests_count"], 2)
        self.assertEqual(data["confirmed_guests_count"], 2)
        self.assertEqual(data["unconfirmed_guests_count"], 0)

        # 5. Delete guest 2
        response = self.client.delete(f"/events/{self.event_id_1}/guests/{guest_2['id']}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)

        # Verify counters updated
        response = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"})
        data = response.json()
        self.assertEqual(data["registered_guests_count"], 1)
        self.assertEqual(data["confirmed_guests_count"], 1)
        self.assertEqual(data["unconfirmed_guests_count"], 0)

        # Clean up guest 1
        self.client.delete(f"/events/{self.event_id_1}/guests/{guest_1['id']}", headers={"Authorization": "Bearer test-token"})

    def test_crud_locked_on_finalized_event(self):
        """TC-02: Verifies that adding, editing, or deleting guests in a finalized event raises 400."""
        payload = {"full_name": "Blocked Guest"}
        response = self.client.post(f"/events/{self.event_id_finalized}/guests", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", response.json()["detail"])

        # Edit attempt
        payload = {"notes": "Will fail"}
        response = self.client.patch(f"/events/{self.event_id_finalized}/guests/{self.guest_id_finalized}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 400)

        # Delete attempt
        response = self.client.delete(f"/events/{self.event_id_finalized}/guests/{self.guest_id_finalized}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 400)

    def test_ownership_protection(self):
        """TC-03: User B should not be able to read or modify guests of User A."""
        self.current_test_user = MockUser(USER_B_ID)

        # List attempt
        response = self.client.get(f"/events/{self.event_id_1}/guests", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

        # Create attempt
        payload = {"full_name": "Spy"}
        response = self.client.post(f"/events/{self.event_id_1}/guests", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 404)

    def test_guest_count_synchronization(self):
        """TC-04: Sincronización de guest_count when total guests registered exceeds cupo previsto."""
        # Event started with guest_count = 2 (Event A1)
        # 1. Create Guest 1 (Total = 1 <= 2) -> guest_count should still be 2
        response = self.client.post(f"/events/{self.event_id_1}/guests", json={"full_name": "G1"}, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        g1_id = response.json()["id"]

        detail = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"}).json()
        self.assertEqual(detail["guest_count"], 2)

        # 2. Create Guest 2 (Total = 2 <= 2) -> guest_count should still be 2
        response = self.client.post(f"/events/{self.event_id_1}/guests", json={"full_name": "G2"}, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        g2_id = response.json()["id"]

        detail = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"}).json()
        self.assertEqual(detail["guest_count"], 2)

        # 3. Create Guest 3 (Total = 3 > 2) -> guest_count should be updated to 3
        response = self.client.post(f"/events/{self.event_id_1}/guests", json={"full_name": "G3"}, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        g3_id = response.json()["id"]

        detail = self.client.get(f"/events/{self.event_id_1}", headers={"Authorization": "Bearer test-token"}).json()
        self.assertEqual(detail["guest_count"], 3)

        # Clean up guests
        for gid in [g1_id, g2_id, g3_id]:
            self.client.delete(f"/events/{self.event_id_1}/guests/{gid}", headers={"Authorization": "Bearer test-token"})

    def test_patch_compatibility(self):
        """TC-05: guest_count is still editable via PATCH /events/{id}."""
        response = self.client.patch(f"/events/{self.event_id_1}", json={"guest_count": 10}, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["guest_count"], 10)


if __name__ == "__main__":
    unittest.main()

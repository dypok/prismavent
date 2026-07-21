import os
import sys
import unittest
from datetime import date, timedelta
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import text
from unittest.mock import MagicMock, patch

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

class TestIntegrationEventTasks(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.event_id_owner = str(uuid4())
        cls.event_id_other = str(uuid4())
        cls.event_id_finalized = str(uuid4())
        future_date = date.today() + timedelta(days=10)

        cls.db = SessionLocal()
        try:
            cls.db.execute(text("DELETE FROM events WHERE id IN (:e1, :e2, :e3)"), {
                "e1": cls.event_id_owner,
                "e2": cls.event_id_other,
                "e3": cls.event_id_finalized
            })
            cls.db.commit()

            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, status, visibility_status)
                VALUES (:id, :user_id, 'Owner Event', :event_date, 'planificando', 'active')
            """), {"id": cls.event_id_owner, "user_id": USER_A_ID, "event_date": future_date})

            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, status, visibility_status)
                VALUES (:id, :user_id, 'Other Event', :event_date, 'planificando', 'active')
            """), {"id": cls.event_id_other, "user_id": USER_B_ID, "event_date": future_date})

            cls.db.execute(text("""
                INSERT INTO events (id, user_id, name, event_date, status, visibility_status)
                VALUES (:id, :user_id, 'Finalized Event', :event_date, 'finalizado', 'active')
            """), {"id": cls.event_id_finalized, "user_id": USER_A_ID, "event_date": future_date})

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
            db.execute(text("""
                DELETE FROM event_tasks WHERE event_id IN (:e1, :e2, :e3)
            """), {"e1": cls.event_id_owner, "e2": cls.event_id_other, "e3": cls.event_id_finalized})
            db.execute(text("""
                DELETE FROM events WHERE id IN (:e1, :e2, :e3)
            """), {"e1": cls.event_id_owner, "e2": cls.event_id_other, "e3": cls.event_id_finalized})
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

    def _create_task(self, event_id: str, due_date: str):
        return self.client.post(
            f"/events/{event_id}/tasks",
            json={"title": "Test Task", "due_date": due_date, "priority": "medium"},
            headers={"Authorization": "Bearer test-token"}
        )

    def test_create_task_success(self):
        future_date = str(date.today() + timedelta(days=5))
        response = self._create_task(self.event_id_owner, future_date)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["title"], "Test Task")
        self.assertEqual(data["status"], "todo")
        self.assertEqual(data["priority"], "medium")
        self.assertEqual(data["due_date"], future_date)
        self.assertIsNotNone(data["id"])
        self.assertIsNotNone(data["created_at"])

    def test_create_task_due_date_after_event(self):
        far_date = str(date.today() + timedelta(days=20))
        response = self._create_task(self.event_id_owner, far_date)
        self.assertEqual(response.status_code, 400)
        self.assertIn("after the event date", response.json()["detail"])

    def test_create_task_forbidden(self):
        future_date = str(date.today() + timedelta(days=5))
        response = self._create_task(self.event_id_other, future_date)
        self.assertEqual(response.status_code, 403)

    def test_create_task_event_not_found(self):
        future_date = str(date.today() + timedelta(days=5))
        response = self._create_task(str(uuid4()), future_date)
        self.assertEqual(response.status_code, 404)

    def test_create_task_event_finalized(self):
        future_date = str(date.today() + timedelta(days=5))
        response = self._create_task(self.event_id_finalized, future_date)
        self.assertEqual(response.status_code, 400)

    def test_get_tasks_success(self):
        future_date = str(date.today() + timedelta(days=5))
        self._create_task(self.event_id_owner, future_date)
        response = self.client.get(
            f"/events/{self.event_id_owner}/tasks",
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

    def test_update_task_success(self):
        future_date = str(date.today() + timedelta(days=5))
        task_id = self._create_task(self.event_id_owner, future_date).json()["id"]
        response = self.client.patch(
            f"/events/{self.event_id_owner}/tasks/{task_id}",
            json={"title": "Updated Title", "priority": "high"},
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["title"], "Updated Title")
        self.assertEqual(data["priority"], "high")

    def test_update_task_not_found(self):
        response = self.client.patch(
            f"/events/{self.event_id_owner}/tasks/{uuid4()}",
            json={"title": "Nope"},
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 404)

    def test_move_task_success(self):
        future_date = str(date.today() + timedelta(days=5))
        task_id = self._create_task(self.event_id_owner, future_date).json()["id"]
        response = self.client.patch(
            f"/events/{self.event_id_owner}/tasks/{task_id}/move",
            json={"status": "in_progress"},
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "in_progress")

    def test_move_task_invalid_status(self):
        future_date = str(date.today() + timedelta(days=5))
        task_id = self._create_task(self.event_id_owner, future_date).json()["id"]
        response = self.client.patch(
            f"/events/{self.event_id_owner}/tasks/{task_id}/move",
            json={"status": "invalid_status"},
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 422)

    def test_delete_task_success(self):
        future_date = str(date.today() + timedelta(days=5))
        task_id = self._create_task(self.event_id_owner, future_date).json()["id"]
        response = self.client.delete(
            f"/events/{self.event_id_owner}/tasks/{task_id}",
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify it's gone
        get_response = self.client.get(
            f"/events/{self.event_id_owner}/tasks",
            headers={"Authorization": "Bearer test-token"}
        )
        tasks = get_response.json()
        self.assertNotIn(task_id, [t["id"] for t in tasks])

    def test_delete_task_not_found(self):
        response = self.client.delete(
            f"/events/{self.event_id_owner}/tasks/{uuid4()}",
            headers={"Authorization": "Bearer test-token"}
        )
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()

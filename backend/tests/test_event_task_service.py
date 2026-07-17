import os
import sys
import unittest
from datetime import date, timedelta
from fastapi import HTTPException

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.event_task_service import _validate_due_date_not_after_event

class TestEventTaskService(unittest.TestCase):
    def test_due_date_before_event(self):
        try:
            _validate_due_date_not_after_event(date(2026, 10, 5), date(2026, 10, 10))
        except HTTPException:
            self.fail("_validate_due_date_not_after_event raised HTTPException unexpectedly")

    def test_due_date_equal_to_event(self):
        try:
            _validate_due_date_not_after_event(date(2026, 10, 10), date(2026, 10, 10))
        except HTTPException:
            self.fail("_validate_due_date_not_after_event raised HTTPException unexpectedly")

    def test_due_date_after_event(self):
        with self.assertRaises(HTTPException) as ctx:
            _validate_due_date_not_after_event(date(2026, 10, 15), date(2026, 10, 10))
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("after the event date", ctx.exception.detail)

if __name__ == "__main__":
    unittest.main()

import os
import sys
import unittest
from datetime import date, timedelta
from fastapi import HTTPException

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.event_service import (
    validate_event_not_finalized,
    validate_event_date_not_past
)

class TestEventService(unittest.TestCase):
    def test_validate_event_not_finalized_finalized(self):
        """Should raise HTTPException (400) if status is 'finalizado'."""
        with self.assertRaises(HTTPException) as ctx:
            validate_event_not_finalized("finalizado")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", ctx.exception.detail)

    def test_validate_event_not_finalized_active(self):
        """Should not raise error if status is not 'finalizado'."""
        try:
            validate_event_not_finalized("borrador")
            validate_event_not_finalized("planificando")
        except HTTPException:
            self.fail("validate_event_not_finalized raised HTTPException unexpectedly")

    def test_validate_event_date_not_past_past(self):
        """Should raise HTTPException (400) if date is in the past."""
        yesterday = date.today() - timedelta(days=1)
        with self.assertRaises(HTTPException) as ctx:
            validate_event_date_not_past(yesterday)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("event_date no puede ser una fecha en el pasado", ctx.exception.detail)

    def test_validate_event_date_not_past_future_or_none(self):
        """Should not raise error if date is today, in the future, or None."""
        tomorrow = date.today() + timedelta(days=1)
        try:
            validate_event_date_not_past(date.today())
            validate_event_date_not_past(tomorrow)
            validate_event_date_not_past(None)
        except HTTPException:
            self.fail("validate_event_date_not_past raised HTTPException unexpectedly")

if __name__ == "__main__":
    unittest.main()

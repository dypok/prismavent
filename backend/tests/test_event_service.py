import os
import sys
import unittest
from datetime import date, timedelta
from fastapi import HTTPException

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.event_service import (
    validate_event_not_finalized,
    validate_event_date_not_past,
    validate_status_transition
)

class TestEventService(unittest.TestCase):
    def test_validate_event_not_finalized_finalized(self):
        """Should raise HTTPException (400) if status is 'finalizado'."""
        with self.assertRaises(HTTPException) as ctx:
            validate_event_not_finalized("finalizado")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("No se puede modificar un evento finalizado", ctx.exception.detail)

    def test_validate_event_not_finalized_active(self):
        """Should not raise error if status is not 'finalizado' (e.g. 'borrador', 'planificando')."""
        try:
            validate_event_not_finalized("borrador")
            validate_event_not_finalized("planificando")
            validate_event_not_finalized("confirmado")
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

    def test_validate_status_transition_valid_next(self):
        """Should not raise error when transitioning to the immediately next status."""
        try:
            validate_status_transition("borrador", "confirmado")
            validate_status_transition("confirmado", "finalizado")
        except HTTPException:
            self.fail("validate_status_transition raised HTTPException unexpectedly")

    def test_validate_status_transition_skip(self):
        """Should raise HTTPException (400) when skipping a status in the sequence."""
        with self.assertRaises(HTTPException) as ctx:
            validate_status_transition("borrador", "finalizado")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("solo se puede avanzar", ctx.exception.detail)

    def test_validate_status_transition_backward(self):
        """Should raise HTTPException (400) when going backwards in the sequence."""
        with self.assertRaises(HTTPException) as ctx:
            validate_status_transition("confirmado", "borrador")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("solo se puede avanzar", ctx.exception.detail)

    def test_validate_status_transition_invalid_current(self):
        """Should raise HTTPException (400) if current status is not in the sequence."""
        with self.assertRaises(HTTPException) as ctx:
            validate_status_transition("planificando", "borrador")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Estado actual inválido", ctx.exception.detail)

    def test_validate_status_transition_at_end(self):
        """Should raise HTTPException (400) when trying to change from the last status."""
        with self.assertRaises(HTTPException) as ctx:
            validate_status_transition("finalizado", "borrador")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("es el final de la secuencia", ctx.exception.detail)

if __name__ == "__main__":
    unittest.main()

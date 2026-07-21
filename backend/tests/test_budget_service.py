import os
import sys
import unittest
from decimal import Decimal

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.budget_service import calculate_total_estimated, check_budget_alert


class MockItem:
    def __init__(self, quantity=None, unit_price=None):
        if quantity is not None:
            self.quantity = quantity
        if unit_price is not None:
            self.unit_price = unit_price


class TestBudgetService(unittest.TestCase):
    def test_calculate_total_estimated_empty(self):
        """Should return 0.0 for an empty list of items."""
        total = calculate_total_estimated([])
        self.assertEqual(total, Decimal("0.0"))

    def test_calculate_total_estimated_dicts(self):
        """Should correctly calculate total for items represented as dictionaries."""
        items = [
            {"quantity": 2, "unit_price": 50.0},     # 100.0
            {"quantity": 1, "unit_price": "25.50"},  # 25.5
            {"quantity": 3, "unit_price": 0},        # 0.0
        ]
        total = calculate_total_estimated(items)
        self.assertEqual(total, Decimal("125.50"))

    def test_calculate_total_estimated_dicts_missing_keys(self):
        """Should gracefully handle dictionary items with missing quantity or unit_price."""
        items = [
            {"quantity": 2},                         # unit_price missing -> default 0 -> 0.0
            {"unit_price": 50.0},                    # quantity missing -> default 0 -> 0.0
            {},                                      # both missing -> default 0 -> 0.0
        ]
        total = calculate_total_estimated(items)
        self.assertEqual(total, Decimal("0.0"))

    def test_calculate_total_estimated_dicts_none_values(self):
        """Should handle dict items where values are explicitly None by treating them as 0."""
        items = [
            {"quantity": None, "unit_price": 50.0},
            {"quantity": 2, "unit_price": None},
            {"quantity": None, "unit_price": None},
        ]
        total = calculate_total_estimated(items)
        self.assertEqual(total, Decimal("0.0"))

    def test_calculate_total_estimated_objects(self):
        """Should correctly calculate total for items represented as objects."""
        items = [
            MockItem(quantity=3, unit_price=10.0),     # 30.0
            MockItem(quantity=1, unit_price="15.75"),  # 15.75
        ]
        total = calculate_total_estimated(items)
        self.assertEqual(total, Decimal("45.75"))

    def test_calculate_total_estimated_objects_missing_attributes(self):
        """Should gracefully handle object items with missing quantity or unit_price attributes."""
        items = [
            MockItem(quantity=5),                      # unit_price missing -> default 0 -> 0.0
            MockItem(unit_price=20.0),                  # quantity missing -> default 0 -> 0.0
            MockItem(),                                 # both missing -> default 0 -> 0.0
        ]
        total = calculate_total_estimated(items)
        self.assertEqual(total, Decimal("0.0"))

    def test_calculate_total_estimated_objects_none_values(self):
        """Should handle object items where values are explicitly None by treating them as 0."""
        items = [
            MockItem(quantity=None, unit_price=10.0),
            MockItem(quantity=3, unit_price=None),
            MockItem(quantity=None, unit_price=None),
        ]
        total = calculate_total_estimated(items)
        self.assertEqual(total, Decimal("0.0"))

    def test_check_budget_alert_under_budget(self):
        """Should return False if total_estimated is under max_budget."""
        self.assertFalse(check_budget_alert(Decimal("100.0"), 150.0))
        self.assertFalse(check_budget_alert(Decimal("100.0"), "150.0"))

    def test_check_budget_alert_over_budget(self):
        """Should return True if total_estimated is strictly over max_budget."""
        self.assertTrue(check_budget_alert(Decimal("150.0"), 100.0))
        self.assertTrue(check_budget_alert(Decimal("150.0"), "100.0"))

    def test_check_budget_alert_equal_budget(self):
        """Should return False if total_estimated is exactly equal to max_budget."""
        self.assertFalse(check_budget_alert(Decimal("100.0"), 100.0))
        self.assertFalse(check_budget_alert(Decimal("100.0"), "100.0"))

    def test_check_budget_alert_no_budget_limit(self):
        """Should return False if max_budget is None."""
        self.assertFalse(check_budget_alert(Decimal("150.0"), None))

    def test_check_budget_alert_invalid_budget(self):
        """Should return False if max_budget is invalid (e.g. string that cannot be parsed as Decimal)."""
        self.assertFalse(check_budget_alert(Decimal("150.0"), "invalid-budget-value"))
        self.assertFalse(check_budget_alert(Decimal("150.0"), []))  # type: ignore


if __name__ == "__main__":
    unittest.main()

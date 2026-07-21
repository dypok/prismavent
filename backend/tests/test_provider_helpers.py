import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.provider_service import _apply_field


class TestProviderHelpers(unittest.TestCase):
    def test_apply_field_with_value(self):
        updates = []
        params = {}
        _apply_field(updates, params, "name", "Test Provider")
        self.assertEqual(updates, ["name = :name"])
        self.assertEqual(params, {"name": "Test Provider"})

    def test_apply_field_none_value(self):
        updates = []
        params = {}
        _apply_field(updates, params, "phone", None)
        self.assertEqual(updates, [])
        self.assertEqual(params, {})

    def test_apply_field_appends_to_existing(self):
        updates = ["category_id = :category_id"]
        params = {"category_id": "uuid-1"}
        _apply_field(updates, params, "name", "Second")
        self.assertEqual(len(updates), 2)
        self.assertIn("name = :name", updates)
        self.assertEqual(params["name"], "Second")
        self.assertEqual(params["category_id"], "uuid-1")


if __name__ == "__main__":
    unittest.main()

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
from app.main import app

USER_A_ID = "9f716fd2-e147-4211-a5c0-98e0f5143e19" # Admin User
USER_B_ID = "3c608982-f8cb-4eaa-b439-740b3371c131" # Regular User

CATEGORY_ID = "c1000000-0000-0000-0000-000000000001" # Catering
CITY_ID = "d1000000-0000-0000-0000-000000000001" # Barranquilla

class MockUser:
    def __init__(self, id):
        self.id = id

class MockAuthResponse:
    def __init__(self, user):
        self.user = user

class TestIntegrationProviders(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.provider_id_1 = str(uuid4())
        
        cls.db = SessionLocal()
        try:
            # Clean up potential leftovers
            cls.db.execute(text("DELETE FROM profiles WHERE id IN (:u1, :u2)"), {"u1": USER_A_ID, "u2": USER_B_ID})
            cls.db.execute(text("DELETE FROM providers WHERE id = :id"), {"id": cls.provider_id_1})
            cls.db.commit()

            # Insert profiles
            cls.db.execute(
                text("INSERT INTO profiles (id, full_name, role, city_id) VALUES (:id, :full_name, :role, :city_id)"),
                {"id": USER_A_ID, "full_name": "Test Admin", "role": "admin", "city_id": CITY_ID}
            )
            cls.db.execute(
                text("INSERT INTO profiles (id, full_name, role, city_id) VALUES (:id, :full_name, :role, :city_id)"),
                {"id": USER_B_ID, "full_name": "Test User", "role": "user", "city_id": CITY_ID}
            )

            # Insert test provider
            cls.db.execute(
                text("""
                    INSERT INTO providers (id, category_id, city_id, name, description, phone, website, address, reference_price, price_unit, rating)
                    VALUES (:id, :category_id, :city_id, :name, :description, :phone, :website, :address, :reference_price, :price_unit, :rating)
                """),
                {
                    "id": cls.provider_id_1,
                    "category_id": CATEGORY_ID,
                    "city_id": CITY_ID,
                    "name": "Integration Test Provider 1",
                    "description": "Initial description",
                    "phone": "555-1234",
                    "website": "http://testprovider1.com",
                    "address": "123 Test St",
                    "reference_price": 120.00,
                    "price_unit": "por persona",
                    "rating": 4.5
                }
            )
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
            db.execute(text("DELETE FROM providers WHERE name LIKE 'Integration Test%'"))
            db.execute(text("DELETE FROM profiles WHERE id IN (:u1, :u2)"), {"u1": USER_A_ID, "u2": USER_B_ID})
            db.commit()
        finally:
            db.close()

    def setUp(self):
        # Default user is regular user USER_B_ID
        self.current_test_user = MockUser(USER_B_ID)
        self.mock_client = MagicMock()
        self.mock_client.auth.get_user = lambda token: MockAuthResponse(self.current_test_user)
        self.patcher = patch('app.middlewares.auth_middleware.get_supabase_client', return_value=self.mock_client)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_get_providers_as_user(self):
        """GET /providers: User can read and sees can_edit as False."""
        self.current_test_user = MockUser(USER_B_ID)
        response = self.client.get("/providers", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 1)
        
        # Verify our test provider is in the list and can_edit is False
        test_prov = next((p for p in data if p["id"] == self.provider_id_1), None)
        self.assertIsNotNone(test_prov)
        self.assertEqual(test_prov["can_edit"], False)

    def test_get_providers_as_admin(self):
        """GET /providers: Admin can read and sees can_edit as True."""
        self.current_test_user = MockUser(USER_A_ID)
        response = self.client.get("/providers", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 1)
        
        test_prov = next((p for p in data if p["id"] == self.provider_id_1), None)
        self.assertIsNotNone(test_prov)
        self.assertEqual(test_prov["can_edit"], True)

    def test_get_provider_detail(self):
        """GET /providers/{id}: Check detail and can_edit logic."""
        # 1. As regular user
        self.current_test_user = MockUser(USER_B_ID)
        response = self.client.get(f"/providers/{self.provider_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["can_edit"], False)

        # 2. As admin
        self.current_test_user = MockUser(USER_A_ID)
        response = self.client.get(f"/providers/{self.provider_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["can_edit"], True)

    def test_create_provider_as_user_forbidden(self):
        """POST /providers: Regular user receives 403 Forbidden."""
        self.current_test_user = MockUser(USER_B_ID)
        payload = {
            "category_id": CATEGORY_ID,
            "city_id": CITY_ID,
            "name": "Integration Test Forbidden",
            "reference_price": 500.00,
            "rating": 5.0
        }
        response = self.client.post("/providers", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 403)

    def test_create_provider_as_admin(self):
        """POST /providers: Admin creates provider successfully."""
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "category_id": CATEGORY_ID,
            "city_id": CITY_ID,
            "name": "Integration Test Success",
            "description": "Successfully created by admin",
            "phone": "555-9999",
            "website": "http://success.com",
            "address": "789 Success Blvd",
            "reference_price": 350.00,
            "price_unit": "por dia",
            "rating": 4.8
        }
        response = self.client.post("/providers", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["name"], "Integration Test Success")
        self.assertEqual(data["can_edit"], True)
        
        # Clean up
        created_id = data["id"]
        db = SessionLocal()
        try:
            db.execute(text("DELETE FROM providers WHERE id = :id"), {"id": created_id})
            db.commit()
        finally:
            db.close()

    def test_patch_provider_as_user_forbidden(self):
        """PATCH /providers/{id}: Regular user receives 403 Forbidden."""
        self.current_test_user = MockUser(USER_B_ID)
        payload = {
            "name": "Intruders Edit"
        }
        response = self.client.patch(f"/providers/{self.provider_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 403)

    def test_patch_provider_as_admin(self):
        """PATCH /providers/{id}: Admin updates provider details successfully."""
        self.current_test_user = MockUser(USER_A_ID)
        payload = {
            "name": "Integration Test Updated Name",
            "reference_price": 150.00
        }
        response = self.client.patch(f"/providers/{self.provider_id_1}", json=payload, headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Integration Test Updated Name")
        self.assertEqual(float(data["reference_price"]), 150.00)
        self.assertEqual(data["can_edit"], True)

    def test_delete_provider_as_user_forbidden(self):
        """DELETE /providers/{id}: Regular user receives 403 Forbidden."""
        self.current_test_user = MockUser(USER_B_ID)
        response = self.client.delete(f"/providers/{self.provider_id_1}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 403)

    def test_delete_provider_as_admin(self):
        """DELETE /providers/{id}: Admin deletes provider successfully."""
        # 1. Create a provider first
        db = SessionLocal()
        temp_id = str(uuid4())
        try:
            db.execute(
                text("INSERT INTO providers (id, category_id, city_id, name) VALUES (:id, :cat, :city, :name)"),
                {"id": temp_id, "cat": CATEGORY_ID, "city": CITY_ID, "name": "Integration Test To Delete"}
            )
            db.commit()
        finally:
            db.close()

        # 2. Delete it via Admin request
        self.current_test_user = MockUser(USER_A_ID)
        response = self.client.delete(f"/providers/{temp_id}", headers={"Authorization": "Bearer test-token"})
        self.assertEqual(response.status_code, 204)

        # 3. Verify it is gone
        db = SessionLocal()
        try:
            check = db.execute(text("SELECT 1 FROM providers WHERE id = :id"), {"id": temp_id}).fetchone()
            self.assertIsNone(check)
        finally:
            db.close()

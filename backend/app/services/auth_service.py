from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from app.core.supabase import get_supabase_client
from app.database import SessionLocal
from app.utils.security import sanitize_string
import httpx
import os

def log_failed_attempt(db: Session, email: str, ip_address: str, user_agent: str | None = None) -> None:
    db.execute(
        text("""
            INSERT INTO failed_login_attempts (email, ip_address, user_agent)
            VALUES (:email, :ip, :ua)
        """),
        {"email": email, "ip": ip_address, "ua": user_agent}
    )
    db.commit()

def get_recent_failures(db: Session, ip_address: str, minutes: int = 5) -> int:
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    result = db.execute(
        text("""
            SELECT COUNT(*) FROM failed_login_attempts
            WHERE ip_address = :ip AND attempted_at >= :cutoff
        """),
        {"ip": ip_address, "cutoff": cutoff}
    ).scalar()
    return result or 0


def register_user(email: str, password: str, name: str | None, phone: str | None, city_id: str | None) -> dict:
    supabase_client = get_supabase_client()
    safe_name = sanitize_string(name)
    safe_phone = sanitize_string(phone)

    response = supabase_client.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": {
                "name": safe_name,
                "phone": safe_phone
            }
        }
    })

    user_id = response.user.id
    db = SessionLocal()
    try:
        db.execute(
            text("""
                INSERT INTO profiles (id, full_name, phone, city_id, role)
                VALUES (:id, :full_name, :phone, :city_id, 'user')
            """),
            {"id": user_id, "full_name": safe_name, "phone": safe_phone, "city_id": city_id}
        )
        db.commit()
    except Exception as profile_error:
        db.rollback()
        print(f"Warning: Could not create profile for user {user_id}: {profile_error}")
    finally:
        db.close()

    return {
        "message": "Registration successful. Please check your email for verification.",
        "user": response.user
    }


def login_user(email: str, password: str, ip_address: str, user_agent: str | None) -> dict:
    supabase_client = get_supabase_client()
    try:
        response = supabase_client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return {
            "message": "Login successful.",
            "session": response.session,
            "user": response.user
        }
    except Exception:
        try:
            db = SessionLocal()
            log_failed_attempt(db, email=email, ip_address=ip_address, user_agent=user_agent)
            db.close()
        except Exception:
            pass
        raise HTTPException(status_code=400, detail="Invalid email or password")


def update_profile(token: str, name: str | None, password: str | None) -> dict:
    supabase_url = os.getenv("SUPABASE_URL")
    apikey = os.getenv("SUPABASE_ANON_KEY")

    update_data = {}
    if password:
        update_data["password"] = password
    if name:
        update_data["data"] = {"name": name}

    if not update_data:
        return {"message": "Nothing to update."}

    url = f"{supabase_url}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": apikey,
        "Content-Type": "application/json"
    }

    with httpx.Client() as client:
        response = client.put(url, headers=headers, json=update_data)

        if response.status_code >= 400:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json().get("msg", "Error updating profile")
            )

        return {"message": "Profile updated successfully.", "user": response.json()}

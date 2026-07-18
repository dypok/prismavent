from fastapi import APIRouter, HTTPException, Depends
from app.core.supabase import get_supabase_client
from app.schemas.auth import RegisterRequest, LoginRequest, UpdateProfileRequest, UserMeResponse
from app.dependencies import get_current_user
from fastapi import Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import SessionLocal, get_db
import httpx
import os

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(payload: RegisterRequest):
    try:
        supabase_client = get_supabase_client()
        response = supabase_client.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
            "options": {
                "data": {
                    "name": payload.name,
                    "phone": payload.phone
                }
            }
        })
        user_id = response.user.id
        # Create profile row for the new user
        db = SessionLocal()
        try:
            db.execute(
                text("""
                    INSERT INTO profiles (id, full_name, phone, role)
                    VALUES (:id, :full_name, :phone, 'user')
                """),
                {"id": user_id, "full_name": payload.name, "phone": payload.phone}
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(payload: LoginRequest):
    try:
        supabase_client = get_supabase_client()
        response = supabase_client.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })
        return {
            "message": "Login successful.",
            "session": response.session,
            "user": response.user
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
def logout():
    try:
        supabase_client = get_supabase_client()
        supabase_client.auth.sign_out()
        return {
            "message": "Logout successful."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserMeResponse)
def get_me(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the authenticated user's profile including role.
    Used by the frontend to determine admin access.
    """
    profile = db.execute(
        text("SELECT id, full_name, role FROM profiles WHERE id = :id"),
        {"id": current_user.id}
    ).fetchone()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "id": str(profile[0]),
        "full_name": profile[1],
        "role": profile[2]
    }


@router.put("/profile")
def update_profile(request: Request, payload: UpdateProfileRequest):
    token = getattr(request.state, "token", None)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    supabase_url = os.getenv("SUPABASE_URL")
    apikey = os.getenv("SUPABASE_ANON_KEY")
    
    update_data = {}
    if payload.password:
        update_data["password"] = payload.password
    if payload.name:
        update_data["data"] = {"name": payload.name}
        
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
            raise HTTPException(status_code=response.status_code, detail=response.json().get("msg", "Error updating profile"))
            
        return {"message": "Profile updated successfully.", "user": response.json()}

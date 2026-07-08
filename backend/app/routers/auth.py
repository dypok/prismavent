from fastapi import APIRouter, HTTPException
from app.core.supabase import get_supabase_client
from app.schemas.auth import RegisterRequest, LoginRequest

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

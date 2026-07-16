from fastapi import APIRouter, HTTPException
from app.core.supabase import get_supabase_client
from app.schemas.auth import RegisterRequest, LoginRequest, UpdateProfileRequest
from fastapi import Request
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

from fastapi import APIRouter, HTTPException, Depends
from app.schemas.auth import RegisterRequest, LoginRequest, UpdateProfileRequest, UserMeResponse
from app.dependencies import get_current_user
from fastapi import Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.core.rate_limit import limiter
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest) -> dict:
    try:
        return auth_service.register_user(
            email=payload.email,
            password=payload.password,
            name=payload.name,
            phone=payload.phone,
            city_id=payload.city_id,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest) -> dict:
    return auth_service.login_user(
        email=payload.email,
        password=payload.password,
        ip_address=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent"),
    )

@router.post("/logout")
def logout() -> dict:
    try:
        from app.core.supabase import get_supabase_client
        get_supabase_client().auth.sign_out()
        return {"message": "Logout successful."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserMeResponse)
def get_me(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    profile = db.execute(
        text("SELECT id, full_name, role FROM profiles WHERE id = :id"),
        {"id": current_user.id}
    ).fetchone()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"id": str(profile[0]), "full_name": profile[1], "role": profile[2]}

@router.put("/profile")
def update_profile(request: Request, payload: UpdateProfileRequest) -> dict:
    token = getattr(request.state, "token", None)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return auth_service.update_profile(token, name=payload.name, password=payload.password)

from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

def get_current_user(request: Request):
    """
    Dependency to retrieve the current authenticated user from the request state.
    Assumes SupabaseAuthMiddleware has verified the JWT token.
    """
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Unauthorized: User not found in request state"
        )
    return user

def require_admin(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dependency to validate that the current user has the 'admin' role.
    Queries the 'profiles' table to check the 'role' column.
    """
    # Use raw SQL to fetch role of current_user
    profile = db.execute(
        text("SELECT role FROM profiles WHERE id = :id"),
        {"id": current_user.id}
    ).fetchone()
    
    role = profile[0] if profile else None
    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: User does not have administrator privileges"
        )
    return current_user

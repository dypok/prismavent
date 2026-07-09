from fastapi import Request, HTTPException

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

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.supabase import get_supabase_client

class SupabaseAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path in ["/", "/auth/register", "/auth/register/", "/auth/login", "/auth/login/"] or path.startswith(("/docs", "/redoc", "/openapi.json")):
            return await call_next(request)
        
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header. Must be Bearer <token>"}
            )
        
        token = auth_header.split(" ")[1]
        try:
            supabase_client = get_supabase_client()
            response = supabase_client.auth.get_user(token)
            request.state.user = response.user
            request.state.token = token #agregamos por aca el token
        except Exception as e:
            return JSONResponse(
                status_code=401,
                content={"detail": f"Token verification failed: {str(e)}"}
            )
        
        return await call_next(request)

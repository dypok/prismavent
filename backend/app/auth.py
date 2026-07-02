from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from app.supabase_client import get_supabase_client

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(payload: RegisterRequest):
    try:
        supabase_client = get_supabase_client()
        # Llama a supabase.auth.sign_up() con las credenciales correspondientes
        response = supabase_client.auth.sign_up({
            "email": payload.email,
            "password": payload.password
        })
        return {
            "message": "Registration successful. Please check your email for verification.",
            "user": response.user
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class SupabaseAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        # Permitir acceso sin autenticación a rutas públicas
        if path in ["/", "/auth/register", "/auth/register/"] or path.startswith(("/docs", "/redoc", "/openapi.json")):
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
            # Llama a supabase.auth.get_user(token) para validar el token JWT y obtener el usuario
            response = supabase_client.auth.get_user(token)
            request.state.user = response.user
        except Exception as e:
            return JSONResponse(
                status_code=401,
                content={"detail": f"Token verification failed: {str(e)}"}
            )
        
        return await call_next(request)

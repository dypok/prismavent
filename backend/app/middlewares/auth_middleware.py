from starlette.responses import Response
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.supabase import get_supabase_client

def add_cors(response, request):
    origin = request.headers.get("Origin", "*")
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = request.headers.get("Access-Control-Request-Headers", "authorization, content-type")
    response.headers["Access-Control-Allow-Methods"] = request.headers.get("Access-Control-Request-Method", "GET, POST, PATCH, DELETE, OPTIONS")
    return response

class SupabaseAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return add_cors(Response(status_code=200), request)

        path = request.url.path
        if path in ["/", "/auth/register", "/auth/register/", "/auth/login", "/auth/login/"] or path.startswith(("/docs", "/redoc", "/openapi.json")):
            return add_cors(await call_next(request), request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return add_cors(JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header. Must be Bearer <token>"}
            ), request)

        token = auth_header.split(" ")[1]
        try:
            supabase_client = get_supabase_client()
            response = supabase_client.auth.get_user(token)
            request.state.user = response.user
            request.state.token = token
        except Exception as e:
            return add_cors(JSONResponse(
                status_code=401,
                content={"detail": f"Token verification failed: {str(e)}"}
            ), request)

        return add_cors(await call_next(request), request)

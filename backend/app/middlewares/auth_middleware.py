from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.supabase import get_supabase_client

class SupabaseAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request = Request(scope)
        path = request.url.path
        origin = request.headers.get("Origin", "*")

        async def send_cors(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"access-control-allow-origin", origin.encode()))
                headers.append((b"access-control-allow-credentials", b"true"))
                headers.append((b"access-control-allow-headers", b"authorization, content-type"))
                headers.append((b"access-control-allow-methods", b"GET, POST, PATCH, DELETE, OPTIONS"))
                message["headers"] = headers
            await send(message)

        if path not in ("/",) and not path.startswith(("/auth", "/docs", "/redoc", "/openapi.json")) and request.method != "OPTIONS":
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return await JSONResponse(
                    status_code=401,
                    content={"detail": "Missing or invalid Authorization header. Must be Bearer <token>"}
                )(scope, receive, send_cors)

            token = auth_header.split(" ")[1]
            try:
                supabase_client = get_supabase_client()
                user_res = supabase_client.auth.get_user(token)
                scope.setdefault("state", {})["user"] = user_res.user
                scope.setdefault("state", {})["token"] = token
            except Exception as e:
                return await JSONResponse(
                    status_code=401,
                    content={"detail": f"Token verification failed: {str(e)}"}
                )(scope, receive, send_cors)

        await self.app(scope, receive, send_cors)

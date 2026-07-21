import os
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        origin = request.headers.get("Origin", "*")
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        csp_connect = os.getenv("CSP_CONNECT_SRC", "https: http://localhost:5173 ws: wss:")
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://api.iconify.design; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' " + csp_connect + " https://*.supabase.co https://api.iconify.design; "
            "frame-ancestors 'none'"
        )
        return response

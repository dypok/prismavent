from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://api.iconify.design; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' http://localhost:8000 http://localhost:5173 https://*.supabase.co https://api.iconify.design; "
            "frame-ancestors 'none'"
        )
        return response

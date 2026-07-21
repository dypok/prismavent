from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.database import engine, Base
from app.core.rate_limit import limiter
from app.middlewares.security_headers import SecurityHeadersMiddleware
from app.routers.auth import router as auth_router
from app.routers.events import router as events_router
from app.routers.templates import router as templates_router
from app.routers.guests import router as guests_router
from app.routers.event_items import router as event_items_router
from app.routers.weather import router as weather_router
from app.routers.providers import router as providers_router
from app.routers.provider_categories import router as provider_categories_router
from app.routers.user_templates import router as user_templates_router
from app.routers.event_tasks import router as event_tasks_router
from app.routers.cities import router as cities_router
from app.routers.public_stats import router as public_stats_router
from app.routers.admin_providers import router as admin_providers_router
from app.routers.admin_metrics import router as admin_metrics_router
from app.middlewares.auth_middleware import SupabaseAuthMiddleware
from app.routers.admin_provider_categories import router as admin_provider_categories_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Prismavent API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SupabaseAuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(templates_router)
app.include_router(guests_router)
app.include_router(event_items_router)
app.include_router(weather_router)
app.include_router(providers_router)
app.include_router(provider_categories_router)
app.include_router(user_templates_router)
app.include_router(event_tasks_router)
app.include_router(cities_router)
app.include_router(public_stats_router)
app.include_router(admin_provider_categories_router)
app.include_router(admin_providers_router)
app.include_router(admin_metrics_router)

@app.get("/")
def read_root():
    return {"message": "Connected"}
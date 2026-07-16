from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers.auth import router as auth_router
from app.routers.events import router as events_router
from app.routers.templates import router as templates_router
from app.routers.guests import router as guests_router
from app.routers.event_items import router as event_items_router
from app.routers.weather import router as weather_router
from app.middlewares.auth_middleware import SupabaseAuthMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Prismavent API", version="1.0.0")

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

@app.get("/")
def read_root():
    return {"message": "Connected"}
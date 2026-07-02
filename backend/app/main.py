from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.auth import router as auth_router, SupabaseAuthMiddleware

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

@app.get("/")
def read_root():
    return {"message": "Connected"}

@app.get("/protected-route")
def protected_route(request: Request):
    user = getattr(request.state, "user", None)
    return {
        "message": "Access granted to protected route",
        "user_id": user.id if user else None,
        "email": user.email if user else None
    }
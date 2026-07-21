from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import provider_service

router = APIRouter(prefix="/stats", tags=["public-stats"])

@router.get("")
def get_public_stats(db: Session = Depends(get_db)) -> dict:
    return provider_service.get_public_stats(db)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.database import get_db
from app.schemas.city import CityResponse

router = APIRouter(prefix="/cities", tags=["cities"])

@router.get("", response_model=List[CityResponse])
def list_cities(db: Session = Depends(get_db)) -> List[CityResponse]:
    rows = db.execute(
        text("SELECT id, name, department, country FROM cities WHERE active = true ORDER BY name")
    ).fetchall()
    return [dict(r._mapping) for r in rows]

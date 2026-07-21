from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.provider import ProviderCategoryResponse
from typing import List

router = APIRouter(prefix="/provider-categories", tags=["provider-categories"])

@router.get("", response_model=List[ProviderCategoryResponse])
def list_provider_categories(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[ProviderCategoryResponse]:
    rows = db.execute(
        text("SELECT id, name FROM provider_categories ORDER BY name")
    ).fetchall()
    return [{"id": row[0], "name": row[1]} for row in rows]

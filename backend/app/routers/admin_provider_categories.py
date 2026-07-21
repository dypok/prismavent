from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin
from app.schemas.provider_category import CategoryCreate, CategoryUpdate
from app.services import provider_category_service

router = APIRouter(prefix="/admin/provider-categories", tags=["admin-provider-categories"])

@router.get("")
def list_categories_admin(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
) -> list:
    return provider_category_service.list_categories(db)

@router.post("", status_code=201)
def create_category(
    payload: CategoryCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
) -> dict:
    return provider_category_service.create_category(payload, db)

@router.put("/{category_id}")
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
) -> dict:
    return provider_category_service.update_category(category_id, payload, db)

@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
) -> None:
    provider_category_service.delete_category(category_id, db)
    return Response(status_code=204)

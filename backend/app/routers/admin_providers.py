from fastapi import APIRouter, Depends, Response, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin
from app.schemas.provider import ProviderCreate, ProviderUpdate, ProviderResponse, ProviderDetailResponse, AdminProviderListResponse
from app.services import provider_service
from typing import Optional

router = APIRouter(prefix="/admin/providers", tags=["admin-providers"])

@router.get("", response_model=AdminProviderListResponse)
def list_providers_admin(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    providers, total = provider_service.list_providers_paginated(
        db, page=page, per_page=per_page, search=search, category_id=category_id
    )
    for p in providers:
        p["can_edit"] = True
    return {
        "providers": providers,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0
    }

@router.get("/{provider_id}", response_model=ProviderDetailResponse)
def get_provider_admin(
    provider_id: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    provider = provider_service.get_provider_detail(provider_id, db)
    provider["can_edit"] = True
    return provider

@router.post("", response_model=ProviderResponse, status_code=201)
def create_provider_admin(
    payload: ProviderCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    provider = provider_service.create_provider(payload, db)
    provider["can_edit"] = True
    return provider

@router.put("/{provider_id}", response_model=ProviderResponse)
def update_provider_admin(
    provider_id: str,
    payload: ProviderCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    update_payload = ProviderUpdate(**payload.model_dump())
    provider = provider_service.update_provider(provider_id, update_payload, db)
    provider["can_edit"] = True
    return provider

@router.delete("/{provider_id}", status_code=204)
def delete_provider_admin(
    provider_id: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    provider_service.delete_provider_with_integrity(provider_id, db)
    return Response(status_code=204)

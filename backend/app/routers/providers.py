from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.schemas.provider import ProviderCreate, ProviderUpdate, ProviderResponse
from app.services import provider_service
from typing import List, Optional

router = APIRouter(prefix="/providers", tags=["providers"])

@router.get("", response_model=List[ProviderResponse])
def get_providers(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[ProviderResponse]:
    is_admin = provider_service.check_admin_role(current_user.id, db)
    providers_list = provider_service.list_providers(db, category_id, search)
    for p in providers_list:
        p["can_edit"] = is_admin
    return providers_list

@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(
    provider_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ProviderResponse:
    is_admin = provider_service.check_admin_role(current_user.id, db)
    provider = provider_service.get_provider_by_id(provider_id, db)
    provider["can_edit"] = is_admin
    return provider

@router.post("", response_model=ProviderResponse, status_code=201)
def create_provider(
    payload: ProviderCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
) -> ProviderResponse:
    provider = provider_service.create_provider(payload, db)
    provider["can_edit"] = True
    return provider

@router.patch("/{provider_id}", response_model=ProviderResponse)
def update_provider(
    provider_id: str,
    payload: ProviderUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
) -> ProviderResponse:
    provider = provider_service.update_provider(provider_id, payload, db)
    provider["can_edit"] = True
    return provider

@router.delete("/{provider_id}", status_code=204)
def delete_provider(
    provider_id: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
) -> None:
    provider_service.delete_provider(provider_id, db)
    return Response(status_code=204)

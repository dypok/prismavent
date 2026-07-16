from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
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
):
    """
    Returns the list of providers from the catalog, optionally filtered by category_id or search string.
    Includes the 'can_edit' attribute calculated based on the user's role.
    """
    profile = db.execute(
        text("SELECT role FROM profiles WHERE id = :id"),
        {"id": current_user.id}
    ).fetchone()
    
    is_admin = (profile is not None and profile[0] == "admin")
    
    providers_list = provider_service.list_providers(db, category_id, search)
    for p in providers_list:
        p["can_edit"] = is_admin
        
    return providers_list

@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(
    provider_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the details of a single provider by ID.
    Includes the 'can_edit' attribute calculated based on the user's role.
    """
    profile = db.execute(
        text("SELECT role FROM profiles WHERE id = :id"),
        {"id": current_user.id}
    ).fetchone()
    
    is_admin = (profile is not None and profile[0] == "admin")
    
    provider = provider_service.get_provider_by_id(provider_id, db)
    provider["can_edit"] = is_admin
    
    return provider

@router.post("", response_model=ProviderResponse, status_code=201)
def create_provider(
    payload: ProviderCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Allows system administrators to add a new provider to the catalog.
    """
    provider = provider_service.create_provider(payload, db)
    provider["can_edit"] = True
    return provider

@router.patch("/{provider_id}", response_model=ProviderResponse)
def update_provider(
    provider_id: str,
    payload: ProviderUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Allows system administrators to edit an existing provider in the catalog.
    """
    provider = provider_service.update_provider(provider_id, payload, db)
    provider["can_edit"] = True
    return provider

@router.delete("/{provider_id}", status_code=204)
def delete_provider(
    provider_id: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Allows system administrators to delete a provider from the catalog.
    """
    provider_service.delete_provider(provider_id, db)
    return Response(status_code=204)

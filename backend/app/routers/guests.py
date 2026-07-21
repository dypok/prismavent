from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.guest import GuestCreate, GuestUpdate, GuestResponse
from app.services import guest_service
from typing import List

router = APIRouter(prefix="/events", tags=["guests"])

@router.get("/{event_id}/guests", response_model=List[GuestResponse])
def get_guests(
    event_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[GuestResponse]:
    return guest_service.get_guests_by_event(event_id, current_user.id, db)

@router.post("/{event_id}/guests", response_model=GuestResponse)
def create_guest(
    event_id: str,
    payload: GuestCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> GuestResponse:
    return guest_service.create_guest(event_id, current_user.id, payload, db)

@router.patch("/{event_id}/guests/{guest_id}", response_model=GuestResponse)
def update_guest(
    event_id: str,
    guest_id: str,
    payload: GuestUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> GuestResponse:
    return guest_service.update_guest(event_id, guest_id, current_user.id, payload, db)

@router.delete("/{event_id}/guests/{guest_id}")
def delete_guest(
    event_id: str,
    guest_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    guest_service.delete_guest(event_id, guest_id, current_user.id, db)
    return {"message": "Invitado eliminado exitosamente"}

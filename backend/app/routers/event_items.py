from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.event_item import EventItemCreate, EventItemUpdate
from app.schemas.event import EventDetailOut
from app.dependencies import get_current_user
from app.services import event_item_service

router = APIRouter(prefix="/events", tags=["event_items"])

@router.post("/{event_id}/items", response_model=EventDetailOut)
def create_event_item(
    event_id: str,
    payload: EventItemCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> EventDetailOut:
    return event_item_service.create_event_item(event_id, current_user.id, payload, db)

@router.patch("/{event_id}/items/{item_id}", response_model=EventDetailOut)
def update_event_item(
    event_id: str,
    item_id: str,
    payload: EventItemUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> EventDetailOut:
    return event_item_service.update_event_item(event_id, item_id, current_user.id, payload, db)

@router.delete("/{event_id}/items/{item_id}", response_model=EventDetailOut)
def delete_event_item(
    event_id: str,
    item_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> EventDetailOut:
    return event_item_service.delete_event_item(event_id, item_id, current_user.id, db)

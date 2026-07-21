from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.event import EventCreate, EventResponse, EventDetailOut, EventUpdate, EventStatusUpdate, EventHistoryOut, VALID_EVENT_STATUSES
from app.dependencies import get_current_user
from app.services import event_service
from typing import List, Optional

router = APIRouter(prefix="/events", tags=["events"])

@router.post("", response_model=EventResponse)
def create_event(payload: EventCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)) -> EventResponse:
    try:
        return event_service.create_event(current_user.id, payload, db)
    except Exception as e:
        raise e

@router.get("", response_model=List[EventResponse])
def get_events(
    status: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[EventResponse]:
    if status is not None and status not in VALID_EVENT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"status inválido: '{status}'. Debe ser uno de: {', '.join(sorted(VALID_EVENT_STATUSES))}"
        )
    try:
        return event_service.list_user_events(current_user.id, status, db)
    except Exception as e:
        raise e

@router.get("/{event_id}", response_model=EventDetailOut)
def get_event(event_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)) -> EventDetailOut:
    try:
        event = event_service._verify_ownership(event_id, current_user.id, db)
        event = event_service.auto_transition_event_status(event, db)
        return event_service.get_event_detail(event_id, db)
    except Exception as e:
        raise e

@router.patch("/{event_id}", response_model=EventDetailOut)
def update_event(
    event_id: str,
    payload: EventUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EventDetailOut:
    try:
        return event_service.update_event(event_id, current_user.id, payload, db)
    except Exception as e:
        raise e

@router.patch("/{event_id}/status", response_model=EventDetailOut)
def update_event_status(
    event_id: str,
    payload: EventStatusUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EventDetailOut:
    try:
        return event_service.update_event_status(event_id, current_user.id, payload.status, db)
    except Exception as e:
        raise e

@router.get("/{event_id}/history", response_model=List[EventHistoryOut])
def get_event_history(
    event_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[EventHistoryOut]:
    try:
        return event_service.get_event_history(event_id, current_user.id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving event history: {str(e)}")

@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        event_service.delete_event(event_id, current_user.id, db)
        return {"message": "Evento eliminado exitosamente"}
    except Exception as e:
        raise e

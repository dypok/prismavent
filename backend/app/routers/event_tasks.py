from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.event_task import EventTaskCreate, EventTaskUpdate, EventTaskMove, EventTaskResponse
from app.services import event_task_service
from typing import List

router = APIRouter(prefix="/events", tags=["event_tasks"])

@router.get("/{event_id}/tasks", response_model=List[EventTaskResponse])
def get_tasks(
    event_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return event_task_service.get_tasks_by_event(event_id, current_user.id, db)

@router.post("/{event_id}/tasks", response_model=EventTaskResponse)
def create_task(
    event_id: str,
    payload: EventTaskCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return event_task_service.create_task(event_id, current_user.id, payload, db)

@router.patch("/{event_id}/tasks/{task_id}", response_model=EventTaskResponse)
def update_task(
    event_id: str,
    task_id: str,
    payload: EventTaskUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return event_task_service.update_task(event_id, task_id, current_user.id, payload, db)

@router.patch("/{event_id}/tasks/{task_id}/move", response_model=EventTaskResponse)
def move_task(
    event_id: str,
    task_id: str,
    payload: EventTaskMove,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return event_task_service.move_task(event_id, task_id, current_user.id, payload.status, db)

@router.delete("/{event_id}/tasks/{task_id}")
def delete_task(
    event_id: str,
    task_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event_task_service.delete_task(event_id, task_id, current_user.id, db)
    return {"detail": "Task deleted successfully"}

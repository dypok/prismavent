from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date
from app.schemas.event_task import EventTaskCreate, EventTaskUpdate
from app.services.event_service import validate_event_not_finalized

def get_tasks_by_event(event_id: str, user_id: str, db: Session) -> list:
    event_res = db.execute(
        text("SELECT user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()

    if not event_res:
        raise HTTPException(status_code=404, detail="Event not found")

    if str(event_res[0]) != str(user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to access this event")

    tasks_res = db.execute(
        text("SELECT * FROM event_tasks WHERE event_id = :event_id ORDER BY created_at ASC"),
        {"event_id": event_id}
    ).fetchall()

    return [dict(t._mapping) for t in tasks_res] if tasks_res else []

def create_task(event_id: str, user_id: str, payload: EventTaskCreate, db: Session) -> dict:
    event_res = db.execute(
        text("SELECT status, event_date, user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()

    if not event_res:
        raise HTTPException(status_code=404, detail="Event not found")

    if str(event_res.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to access this event")

    validate_event_not_finalized(event_res.status)
    _validate_due_date_not_after_event(payload.due_date, event_res.event_date)

    insert_res = db.execute(
        text("""
            INSERT INTO event_tasks (event_id, title, description, priority, due_date)
            VALUES (:event_id, :title, :description, :priority, :due_date)
            RETURNING *
        """),
        {
            "event_id": event_id,
            "title": payload.title,
            "description": payload.description,
            "priority": payload.priority,
            "due_date": payload.due_date
        }
    ).fetchone()

    if not insert_res:
        raise HTTPException(status_code=400, detail="Error creating task")

    task = dict(insert_res._mapping)
    db.commit()
    return task

def update_task(event_id: str, task_id: str, user_id: str, payload: EventTaskUpdate, db: Session) -> dict:
    event_res = db.execute(
        text("SELECT status, event_date, user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()

    if not event_res:
        raise HTTPException(status_code=404, detail="Event not found")

    if str(event_res.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to access this event")

    validate_event_not_finalized(event_res.status)

    task_check = db.execute(
        text("SELECT id FROM event_tasks WHERE id = :id AND event_id = :event_id"),
        {"id": task_id, "event_id": event_id}
    ).fetchone()

    if not task_check:
        raise HTTPException(status_code=404, detail="Task not found")

    due_date = payload.due_date
    if due_date is not None:
        _validate_due_date_not_after_event(due_date, event_res.event_date)

    update_res = db.execute(
        text("""
            UPDATE event_tasks
            SET title = COALESCE(:title, title),
                description = COALESCE(:description, description),
                priority = COALESCE(:priority, priority),
                due_date = COALESCE(:due_date, due_date),
                updated_at = NOW()
            WHERE id = :id AND event_id = :event_id
            RETURNING *
        """),
        {
            "id": task_id,
            "event_id": event_id,
            "title": payload.title,
            "description": payload.description,
            "priority": payload.priority,
            "due_date": due_date
        }
    ).fetchone()

    if not update_res:
        raise HTTPException(status_code=400, detail="Error updating task")

    task = dict(update_res._mapping)
    db.commit()
    return task

def move_task(event_id: str, task_id: str, user_id: str, new_status: str, db: Session) -> dict:
    event_res = db.execute(
        text("SELECT status, user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()

    if not event_res:
        raise HTTPException(status_code=404, detail="Event not found")

    if str(event_res.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to access this event")

    validate_event_not_finalized(event_res.status)

    task_check = db.execute(
        text("SELECT id FROM event_tasks WHERE id = :id AND event_id = :event_id"),
        {"id": task_id, "event_id": event_id}
    ).fetchone()

    if not task_check:
        raise HTTPException(status_code=404, detail="Task not found")

    update_res = db.execute(
        text("""
            UPDATE event_tasks
            SET status = :status,
                updated_at = NOW()
            WHERE id = :id AND event_id = :event_id
            RETURNING *
        """),
        {
            "id": task_id,
            "event_id": event_id,
            "status": new_status
        }
    ).fetchone()

    if not update_res:
        raise HTTPException(status_code=400, detail="Error moving task")

    task = dict(update_res._mapping)
    db.commit()
    return task

def delete_task(event_id: str, task_id: str, user_id: str, db: Session) -> None:
    event_res = db.execute(
        text("SELECT status, user_id FROM events WHERE id = :id"),
        {"id": event_id}
    ).fetchone()

    if not event_res:
        raise HTTPException(status_code=404, detail="Event not found")

    if str(event_res.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="You do not have permission to access this event")

    validate_event_not_finalized(event_res.status)

    task_check = db.execute(
        text("SELECT id FROM event_tasks WHERE id = :id AND event_id = :event_id"),
        {"id": task_id, "event_id": event_id}
    ).fetchone()

    if not task_check:
        raise HTTPException(status_code=404, detail="Task not found")

    db.execute(
        text("DELETE FROM event_tasks WHERE id = :id AND event_id = :event_id"),
        {"id": task_id, "event_id": event_id}
    )
    db.commit()

def _validate_due_date_not_after_event(due_date: date, event_date: date) -> None:
    from datetime import datetime
    if isinstance(event_date, datetime):
        event_date = event_date.date()
    if isinstance(due_date, datetime):
        due_date = due_date.date()
    if due_date > event_date:
        raise HTTPException(
            status_code=400,
            detail="Task due date cannot be after the event date."
        )

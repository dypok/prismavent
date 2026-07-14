from datetime import date
from fastapi import HTTPException

def validate_event_not_finalized(status: str) -> None:
    """
    Raises HTTP 400 if the event status is 'finalizado'.
    """
    if status == "finalizado":
        raise HTTPException(
            status_code=400,
            detail="No se puede modificar un evento finalizado"
        )

def validate_event_date_not_past(event_date: date) -> None:
    """
    Raises HTTP 400 if the event date is set to a past date.
    """
    if event_date and event_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="event_date no puede ser una fecha en el pasado"
        )

from datetime import date
from fastapi import HTTPException
from app.schemas.event import STATUS_SEQUENCE

def validate_status_transition(current_status: str, new_status: str) -> None:
    """
    Raises HTTP 400 if new_status is not the immediately next status
    in the STATUS_SEQUENCE after current_status.
    """
    try:
        current_index = STATUS_SEQUENCE.index(current_status)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Estado actual inválido: '{current_status}'"
        )

    if current_index >= len(STATUS_SEQUENCE) - 1:
        raise HTTPException(
            status_code=400,
            detail=f"El estado '{current_status}' es el final de la secuencia y no puede cambiar"
        )

    expected_next = STATUS_SEQUENCE[current_index + 1]
    if new_status != expected_next:
        raise HTTPException(
            status_code=400,
            detail=f"Desde '{current_status}' solo se puede avanzar al estado '{expected_next}', no a '{new_status}'"
        )

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

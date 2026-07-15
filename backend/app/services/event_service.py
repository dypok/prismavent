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

def validate_event_not_finalized(current_status: str) -> None:
    """
    Raises a 400 Bad Request error if the event's status is 'finalizado'.
    """
    if current_status == "finalizado":
        raise HTTPException(status_code=400, detail="No se puede modificar un evento finalizado")

def validate_event_date_not_past(new_date: date | None) -> None:
    """
    Raises a 400 Bad Request error if the new event_date is in the past.
    """
    if new_date is not None and new_date < date.today():
        raise HTTPException(status_code=400, detail="event_date no puede ser una fecha en el pasado")

def validate_guest_count_editable(payload_guest_count: int | None, guest_tracking_enabled: bool) -> None:
    """
    Raises a 400 Bad Request error if the client attempts to manually set guest_count
    when guest tracking by name is enabled.
    """
    if payload_guest_count is not None and guest_tracking_enabled:
        raise HTTPException(
            status_code=400,
            detail="guest_count se calcula automáticamente desde la lista de invitados y no puede editarse manualmente"
        )

def validate_event_is_draft(status: str) -> None:
    """
    Raises a 400 Bad Request error if the event's status is not 'borrador'.
    """
    if status != "borrador":
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden eliminar eventos en estado borrador"
        )

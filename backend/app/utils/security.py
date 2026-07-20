import re
from uuid import UUID as UUIDValidator
from fastapi import HTTPException

def sanitize_string(value: str | None) -> str | None:
    if not value:
        return value
    value = re.sub(r'<[^>]*>', '', value)
    value = re.sub(r'\s+', ' ', value).strip()
    return value

def validate_uuid(value: str, field_name: str = "id") -> str:
    try:
        UUIDValidator(value)
        return value
    except ValueError:
        raise HTTPException(status_code=422, detail=f"{field_name} must be a valid UUID")

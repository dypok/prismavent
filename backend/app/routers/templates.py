from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.template import TemplateResponse
from app.services import template_service
from typing import List

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("", response_model=List[TemplateResponse])
def get_templates(request: Request, db: Session = Depends(get_db)) -> List[TemplateResponse]:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found in request state")
    return template_service.list_templates(db)

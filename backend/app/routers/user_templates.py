import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user_template import UserTemplate
from app.schemas.user_template import UserTemplateCreate, UserTemplateResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user-templates", tags=["User Templates"])

@router.post("", response_model=UserTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_user_template(
    template_data: UserTemplateCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        new_template = UserTemplate(
            id=uuid.uuid4(),
            user_id=uuid.UUID(str(current_user.id)),
            event_type_id=uuid.UUID(template_data.event_type_id) if template_data.event_type_id else None,
            name=template_data.name,
            description=template_data.description,
            source_template_id=uuid.UUID(template_data.source_template_id) if template_data.source_template_id else None,
            items=template_data.items or []
        )
        db.add(new_template)
        db.commit()
        db.refresh(new_template)
        return new_template
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user template: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[UserTemplateResponse])
def get_user_templates(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    templates = db.query(UserTemplate).filter(UserTemplate.user_id == uuid.UUID(str(current_user.id))).all()
    return templates

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        t_uuid = uuid.UUID(template_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de plantilla inválido")

    template = db.query(UserTemplate).filter(UserTemplate.id == t_uuid).first()
    if not template:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    
    if str(template.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta plantilla")

    db.delete(template)
    db.commit()
    return None

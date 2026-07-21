import uuid
import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user_template import UserTemplate
from app.schemas.user_template import UserTemplateCreate

logger = logging.getLogger(__name__)

def create_user_template(user_id: str, template_data: UserTemplateCreate, db: Session) -> UserTemplate:
    try:
        new_template = UserTemplate(
            id=uuid.uuid4(),
            user_id=uuid.UUID(str(user_id)),
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

def list_user_templates(user_id: str, db: Session) -> list:
    return db.query(UserTemplate).filter(UserTemplate.user_id == uuid.UUID(str(user_id))).all()

def delete_user_template(template_id: str, user_id: str, db: Session) -> None:
    try:
        t_uuid = uuid.UUID(template_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de plantilla inválido")

    template = db.query(UserTemplate).filter(UserTemplate.id == t_uuid).first()
    if not template:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    if str(template.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar esta plantilla")

    db.delete(template)
    db.commit()

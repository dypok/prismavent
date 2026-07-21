from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.user_template import UserTemplateCreate, UserTemplateResponse
from app.services import user_template_service

router = APIRouter(prefix="/user-templates", tags=["User Templates"])

@router.post("", response_model=UserTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_user_template(
    template_data: UserTemplateCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> UserTemplateResponse:
    return user_template_service.create_user_template(current_user.id, template_data, db)

@router.get("", response_model=List[UserTemplateResponse])
def get_user_templates(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> List[UserTemplateResponse]:
    return user_template_service.list_user_templates(current_user.id, db)

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> None:
    user_template_service.delete_user_template(template_id, current_user.id, db)
    return None

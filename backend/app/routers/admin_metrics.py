from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin
from app.schemas.admin_metrics import AdminMetricsResponse
from app.services import provider_service

router = APIRouter(prefix="/admin/metrics", tags=["admin-metrics"])

@router.get("", response_model=AdminMetricsResponse)
def get_admin_metrics(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
) -> AdminMetricsResponse:
    return provider_service.get_admin_metrics(db)

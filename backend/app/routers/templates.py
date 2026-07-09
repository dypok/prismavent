from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.template import TemplateResponse
from typing import List

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("", response_model=List[TemplateResponse])
def get_templates(request: Request, db: Session = Depends(get_db)):
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found in request state")
        
    try:
        # Fetch templates from database
        result = db.execute(
            text("SELECT id, event_type_id, name, description, default_items FROM templates")
        ).fetchall()
        
        templates_list = []
        for row in result:
            row_dict = dict(row._mapping)
            # Map default_items (jsonb) column to template_items in the schema response
            row_dict["template_items"] = row_dict.pop("default_items", [])
            templates_list.append(row_dict)
            
        return templates_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving templates: {str(e)}")

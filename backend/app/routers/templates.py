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
        # Fetch templates from database joining with event_types for colors
        result = db.execute(
            text("""
            SELECT t.id, t.event_type_id, t.name, t.description, t.icon_url, t.default_items,
                   et.color_bg, et.color_icon
            FROM templates t
            LEFT JOIN event_types et ON t.event_type_id = et.id
            """)
        ).fetchall()
        
        templates_list = []
        for row in result:
            row_dict = dict(row._mapping)
            row_dict["id"] = str(row_dict["id"])
            row_dict["event_type_id"] = str(row_dict["event_type_id"])
            # Map default_items (jsonb) column to template_items in the schema response
            row_dict["template_items"] = row_dict.pop("default_items", [])
            templates_list.append(row_dict)
            
        return templates_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving templates: {str(e)}")

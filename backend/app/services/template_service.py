from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

def list_templates(db: Session) -> list:
    try:
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
            row_dict["template_items"] = row_dict.pop("default_items", [])
            templates_list.append(row_dict)

        return templates_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving templates: {str(e)}")

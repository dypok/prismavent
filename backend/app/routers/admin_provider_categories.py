from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.dependencies import require_admin
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

router = APIRouter(prefix="/admin/provider-categories", tags=["admin-provider-categories"])

class CategoryCreate(BaseModel):
    name: str

class CategoryUpdate(BaseModel):
    name: Optional[str] = None

@router.get("")
def list_categories_admin(
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    rows = db.execute(
        text("""
            SELECT pc.id, pc.name, COUNT(p.id)::int AS provider_count
            FROM provider_categories pc
            LEFT JOIN providers p ON p.category_id = pc.id
            GROUP BY pc.id, pc.name
            ORDER BY pc.name
        """)
    ).fetchall()
    return [{"id": str(row[0]), "name": row[1], "provider_count": row[2]} for row in rows]

@router.post("", status_code=201)
def create_category(
    payload: CategoryCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        text("SELECT 1 FROM provider_categories WHERE name ILIKE :name"),
        {"name": payload.name}
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")

    row = db.execute(
        text("INSERT INTO provider_categories (name) VALUES (:name) RETURNING id, name"),
        {"name": payload.name}
    ).fetchone()
    db.commit()
    return {"id": str(row[0]), "name": row[1], "provider_count": 0}

@router.put("/{category_id}")
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        text("SELECT id FROM provider_categories WHERE id = :id"),
        {"id": category_id}
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    if payload.name:
        name_exists = db.execute(
            text("SELECT 1 FROM provider_categories WHERE name ILIKE :name AND id != :id"),
            {"name": payload.name, "id": category_id}
        ).fetchone()
        if name_exists:
            raise HTTPException(status_code=409, detail="Ya existe otra categoría con ese nombre")

    db.execute(
        text("UPDATE provider_categories SET name = :name WHERE id = :id"),
        {"name": payload.name, "id": category_id}
    )
    db.commit()

    row = db.execute(
        text("SELECT pc.id, pc.name, COUNT(p.id)::int AS provider_count FROM provider_categories pc LEFT JOIN providers p ON p.category_id = pc.id WHERE pc.id = :id GROUP BY pc.id, pc.name"),
        {"id": category_id}
    ).fetchone()
    return {"id": str(row[0]), "name": row[1], "provider_count": row[2]}

@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        text("SELECT id FROM provider_categories WHERE id = :id"),
        {"id": category_id}
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    provider_count = db.execute(
        text("SELECT COUNT(*) FROM providers WHERE category_id = :id"),
        {"id": category_id}
    ).scalar()
    if provider_count and provider_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"No se puede eliminar: {provider_count} proveedor(es) usan esta categoría"
        )

    db.execute(
        text("DELETE FROM provider_categories WHERE id = :id"),
        {"id": category_id}
    )
    db.commit()
    return Response(status_code=204)

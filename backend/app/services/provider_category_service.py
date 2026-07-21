from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.provider_category import CategoryCreate, CategoryUpdate


def _format_category(row: dict) -> dict:
    return {"id": str(row[0]), "name": row[1], "provider_count": row[2]}


def _query_with_count(db: Session, category_id: str | None = None) -> list | dict:
    query = """
        SELECT pc.id, pc.name, COUNT(p.id)::int AS provider_count
        FROM provider_categories pc
        LEFT JOIN providers p ON p.category_id = pc.id
    """
    params = {}
    if category_id:
        query += " WHERE pc.id = :id"
        params["id"] = category_id
    query += " GROUP BY pc.id, pc.name ORDER BY pc.name"

    if category_id:
        row = db.execute(text(query), params).fetchone()
        return _format_category(row) if row else None
    rows = db.execute(text(query)).fetchall()
    return [_format_category(r) for r in rows]


def list_categories(db: Session) -> list:
    return _query_with_count(db)


def create_category(payload: CategoryCreate, db: Session) -> dict:
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


def update_category(category_id: str, payload: CategoryUpdate, db: Session) -> dict:
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
    return _query_with_count(db, category_id)


def delete_category(category_id: str, db: Session) -> None:
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

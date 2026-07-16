from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.provider import ProviderCreate, ProviderUpdate
from typing import Optional

def list_providers(db: Session, category_id: Optional[str] = None, search: Optional[str] = None) -> list:
    """
    Fetches the list of providers from the database, optionally filtering by category_id or name (search).
    """
    query = "SELECT * FROM providers WHERE 1=1"
    params = {}
    
    if category_id:
        query += " AND category_id = :category_id"
        params["category_id"] = category_id
        
    if search:
        query += " AND name ILIKE :search"
        params["search"] = f"%{search}%"
        
    query += " ORDER BY name ASC"
    
    res = db.execute(text(query), params).fetchall()
    return [dict(row._mapping) for row in res] if res else []

def get_provider_by_id(provider_id: str, db: Session) -> dict:
    """
    Fetches a single provider by its ID.
    Raises 404 if not found.
    """
    res = db.execute(
        text("SELECT * FROM providers WHERE id = :id"),
        {"id": provider_id}
    ).fetchone()
    
    if not res:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
    return dict(res._mapping)

def create_provider(payload: ProviderCreate, db: Session) -> dict:
    """
    Creates a new provider after validating category_id and city_id.
    """
    # Validate category exists
    category = db.execute(
        text("SELECT 1 FROM provider_categories WHERE id = :id"),
        {"id": payload.category_id}
    ).fetchone()
    if not category:
        raise HTTPException(status_code=400, detail="Categoría no encontrada")
        
    # Validate city exists
    city = db.execute(
        text("SELECT 1 FROM cities WHERE id = :id"),
        {"id": payload.city_id}
    ).fetchone()
    if not city:
        raise HTTPException(status_code=400, detail="Ciudad no encontrada")
        
    insert_res = db.execute(
        text("""
            INSERT INTO providers (category_id, city_id, name, description, phone, website, address, reference_price, price_unit, rating)
            VALUES (:category_id, :city_id, :name, :description, :phone, :website, :address, :reference_price, :price_unit, :rating)
            RETURNING *
        """),
        {
            "category_id": payload.category_id,
            "city_id": payload.city_id,
            "name": payload.name,
            "description": payload.description,
            "phone": payload.phone,
            "website": payload.website,
            "address": payload.address,
            "reference_price": payload.reference_price,
            "price_unit": payload.price_unit,
            "rating": payload.rating
        }
    )
    db.commit()
    row = insert_res.fetchone()
    return dict(row._mapping)

def update_provider(provider_id: str, payload: ProviderUpdate, db: Session) -> dict:
    """
    Updates an existing provider partially, after validating existence, category_id, and city_id if provided.
    """
    # Check existence
    prov = db.execute(
        text("SELECT * FROM providers WHERE id = :id"),
        {"id": provider_id}
    ).fetchone()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
    updates = []
    params = {"id": provider_id}
    
    if payload.category_id is not None:
        category = db.execute(
            text("SELECT 1 FROM provider_categories WHERE id = :id"),
            {"id": payload.category_id}
        ).fetchone()
        if not category:
            raise HTTPException(status_code=400, detail="Categoría no encontrada")
        updates.append("category_id = :category_id")
        params["category_id"] = payload.category_id
        
    if payload.city_id is not None:
        city = db.execute(
            text("SELECT 1 FROM cities WHERE id = :id"),
            {"id": payload.city_id}
        ).fetchone()
        if not city:
            raise HTTPException(status_code=400, detail="Ciudad no encontrada")
        updates.append("city_id = :city_id")
        params["city_id"] = payload.city_id
        
    if payload.name is not None:
        updates.append("name = :name")
        params["name"] = payload.name
        
    if payload.description is not None:
        updates.append("description = :description")
        params["description"] = payload.description
        
    if payload.phone is not None:
        updates.append("phone = :phone")
        params["phone"] = payload.phone
        
    if payload.website is not None:
        updates.append("website = :website")
        params["website"] = payload.website
        
    if payload.address is not None:
        updates.append("address = :address")
        params["address"] = payload.address
        
    if payload.reference_price is not None:
        updates.append("reference_price = :reference_price")
        params["reference_price"] = payload.reference_price
        
    if payload.price_unit is not None:
        updates.append("price_unit = :price_unit")
        params["price_unit"] = payload.price_unit
        
    if payload.rating is not None:
        updates.append("rating = :rating")
        params["rating"] = payload.rating
        
    if not updates:
        return dict(prov._mapping)
        
    update_res = db.execute(
        text(f"""
            UPDATE providers
            SET {', '.join(updates)}
            WHERE id = :id
            RETURNING *
        """),
        params
    )
    db.commit()
    row = update_res.fetchone()
    return dict(row._mapping)

def delete_provider(provider_id: str, db: Session) -> None:
    """
    Physically deletes a provider from the database.
    """
    prov = db.execute(
        text("SELECT 1 FROM providers WHERE id = :id"),
        {"id": provider_id}
    ).fetchone()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        
    db.execute(
        text("DELETE FROM providers WHERE id = :id"),
        {"id": provider_id}
    )
    db.commit()

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func
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
            INSERT INTO providers (category_id, city_id, name, description, phone, email, website, address, image_url, reference_price, price_unit, rating)
            VALUES (:category_id, :city_id, :name, :description, :phone, :email, :website, :address, :image_url, :reference_price, :price_unit, :rating)
            RETURNING *
        """),
        {
            "category_id": payload.category_id,
            "city_id": payload.city_id,
            "name": payload.name,
            "description": payload.description,
            "phone": payload.phone,
            "email": payload.email,
            "website": payload.website,
            "address": payload.address,
            "image_url": payload.image_url,
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

    if payload.email is not None:
        updates.append("email = :email")
        params["email"] = payload.email

    if payload.website is not None:
        updates.append("website = :website")
        params["website"] = payload.website

    if payload.address is not None:
        updates.append("address = :address")
        params["address"] = payload.address

    if payload.image_url is not None:
        updates.append("image_url = :image_url")
        params["image_url"] = payload.image_url
        
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

def list_providers_paginated(db: Session, page: int = 1, per_page: int = 10, search: Optional[str] = None, category_id: Optional[str] = None) -> tuple:
    """
    Fetches providers with pagination, search, category filter, and calculated rating from reviews.
    Returns (providers_list, total_count).
    """
    base_query = """
        FROM providers p
        LEFT JOIN provider_reviews r ON p.id = r.provider_id
        WHERE 1=1
    """
    params = {}
    count_params = {}

    if category_id:
        base_query += " AND p.category_id = :category_id"
        params["category_id"] = category_id
        count_params["category_id"] = category_id

    if search:
        base_query += " AND p.name ILIKE :search"
        params["search"] = f"%{search}%"
        count_params["search"] = f"%{search}%"

    count_query = "SELECT COUNT(DISTINCT p.id) " + base_query
    total = db.execute(text(count_query), count_params).scalar() or 0

    offset = (page - 1) * per_page

    data_query = """
        SELECT p.*, COALESCE(AVG(r.rating)::numeric(2,1), p.rating) AS display_rating
    """ + base_query + """
        GROUP BY p.id
        ORDER BY p.name ASC
        LIMIT :limit OFFSET :offset
    """
    params["limit"] = per_page
    params["offset"] = offset

    res = db.execute(text(data_query), params).fetchall()
    providers = [dict(row._mapping) for row in res] if res else []

    return providers, total

def get_provider_detail(provider_id: str, db: Session) -> dict:
    """
    Fetches a single provider with its reviews and calculated rating.
    """
    provider = get_provider_by_id(provider_id, db)

    reviews_res = db.execute(
        text("SELECT id, provider_id, user_id, rating, comment, created_at FROM provider_reviews WHERE provider_id = :pid ORDER BY created_at DESC"),
        {"pid": provider_id}
    ).fetchall()
    provider["reviews"] = [dict(r._mapping) for r in reviews_res] if reviews_res else []

    if provider["reviews"]:
        avg_res = db.execute(
            text("SELECT AVG(rating)::numeric(2,1) FROM provider_reviews WHERE provider_id = :pid"),
            {"pid": provider_id}
        ).scalar()
        provider["display_rating"] = float(avg_res) if avg_res else provider.get("rating")
    else:
        provider["display_rating"] = provider.get("rating")

    return provider

def delete_provider_with_integrity(provider_id: str, db: Session) -> None:
    """
    Deletes a provider only if it has no reviews. Returns 409 if reviews exist.
    """
    prov = db.execute(
        text("SELECT 1 FROM providers WHERE id = :id"),
        {"id": provider_id}
    ).fetchone()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    review = db.execute(
        text("SELECT 1 FROM provider_reviews WHERE provider_id = :pid LIMIT 1"),
        {"pid": provider_id}
    ).fetchone()
    if review:
        raise HTTPException(status_code=409, detail="No se puede eliminar: el proveedor tiene reseñas vinculadas")

    db.execute(
        text("DELETE FROM providers WHERE id = :id"),
        {"id": provider_id}
    )
    db.commit()

def get_admin_metrics(db: Session) -> dict:
    total_providers = db.execute(text("SELECT COUNT(*) FROM providers")).scalar() or 0
    total_categories = db.execute(text("SELECT COUNT(*) FROM provider_categories")).scalar() or 0

    providers_without_reviews_count = db.execute(
        text("SELECT COUNT(*) FROM providers p WHERE NOT EXISTS (SELECT 1 FROM provider_reviews r WHERE r.provider_id = p.id)")
    ).scalar() or 0

    top_rated_rows = db.execute(
        text("""
            SELECT p.id, p.name, pc.name AS category_name, ct.name AS city_name,
                COALESCE(AVG(r.rating)::numeric(2,1), p.rating) AS display_rating
            FROM providers p
            LEFT JOIN provider_reviews r ON r.provider_id = p.id
            JOIN provider_categories pc ON pc.id = p.category_id
            LEFT JOIN cities ct ON ct.id = p.city_id
            GROUP BY p.id, p.name, pc.name, ct.name, p.rating
            ORDER BY display_rating DESC NULLS LAST
            LIMIT 5
        """)
    ).fetchall()
    top_rated = [dict(row._mapping) for row in top_rated_rows] if top_rated_rows else []

    categories_rows = db.execute(
        text("""
            SELECT c.id, c.name, COUNT(p.id) AS count
            FROM provider_categories c
            LEFT JOIN providers p ON p.category_id = c.id
            GROUP BY c.id, c.name
            ORDER BY c.name
        """)
    ).fetchall()
    categories_with_counts = [dict(row._mapping) for row in categories_rows] if categories_rows else []

    return {
        "total_providers": total_providers,
        "total_categories": total_categories,
        "top_rated": top_rated,
        "categories_with_counts": categories_with_counts,
        "providers_without_reviews_count": providers_without_reviews_count
    }

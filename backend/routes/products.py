from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

try:
    from backend.database.connection import get_db_connection
    from backend.schemas.product import ProductCreate, ProductUpdate, ProductResponse, CategoryResponse
except ImportError:
    from database.connection import get_db_connection
    from schemas.product import ProductCreate, ProductUpdate, ProductResponse, CategoryResponse

router = APIRouter(prefix="/api", tags=["Produtos"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, slug, description, icon FROM categories ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.get("/products", response_model=List[ProductResponse])
def get_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    active_only: bool = True
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if active_only:
        query += " AND is_active = 1"
    if category_id:
        query += " AND category_id = ?"
        params.append(category_id)
    if featured is not None:
        query += " AND featured = ?"
        params.append(1 if featured else 0)
    if search:
        query += " AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY featured DESC, id ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["is_active"] = bool(d["is_active"])
        d["featured"] = bool(d["featured"])
        result.append(d)

    return result

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    d = dict(row)
    d["is_active"] = bool(d["is_active"])
    d["featured"] = bool(d["featured"])
    return d

@router.post("/products", response_model=ProductResponse)
def create_product(product: ProductCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    category_name = product.category_name
    if product.category_id and not category_name:
        cursor.execute("SELECT name FROM categories WHERE id = ?", (product.category_id,))
        cat = cursor.fetchone()
        if cat:
            category_name = cat["name"]

    try:
        cursor.execute("""
        INSERT INTO products (
            name, sku, category_id, category_name, description, price, promo_price,
            unit, min_quantity, box_quantity, stock, image_url, is_active, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            product.name,
            product.sku,
            product.category_id,
            category_name,
            product.description,
            product.price,
            product.promo_price,
            product.unit,
            product.min_quantity,
            product.box_quantity,
            product.stock,
            product.image_url,
            1 if product.is_active else 0,
            1 if product.featured else 0
        ))
        product_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        new_row = cursor.fetchone()
        conn.close()

        d = dict(new_row)
        d["is_active"] = bool(d["is_active"])
        d["featured"] = bool(d["featured"])
        return d
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Erro ao cadastrar produto: {str(e)}")

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    updates = []
    params = []

    for field, val in product.dict(exclude_unset=True).items():
        if field in ["is_active", "featured"]:
            updates.append(f"{field} = ?")
            params.append(1 if val else 0)
        else:
            updates.append(f"{field} = ?")
            params.append(val)

    if not updates:
        conn.close()
        d = dict(existing)
        d["is_active"] = bool(d["is_active"])
        d["featured"] = bool(d["featured"])
        return d

    params.append(product_id)
    sql = f"UPDATE products SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(sql, params)
    conn.commit()

    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    updated = cursor.fetchone()
    conn.close()

    d = dict(updated)
    d["is_active"] = bool(d["is_active"])
    d["featured"] = bool(d["featured"])
    return d

@router.delete("/products/{product_id}")
def delete_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM products WHERE id = ?", (product_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    cursor.execute("UPDATE products SET is_active = 0 WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"message": "Produto desativado com sucesso", "id": product_id}

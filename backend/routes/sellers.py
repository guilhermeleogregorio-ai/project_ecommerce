from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

try:
    from backend.database.connection import get_db_connection
    from backend.schemas.seller import SellerCreate, SellerUpdate, SellerResponse
except ImportError:
    from database.connection import get_db_connection
    from schemas.seller import SellerCreate, SellerUpdate, SellerResponse

router = APIRouter(prefix="/api/sellers", tags=["Vendedores & Força de Vendas"])

@router.get("", response_model=List[SellerResponse])
def get_sellers(active_only: bool = False):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM sellers WHERE 1=1"
    params = []
    if active_only:
        query += " AND active = 1"
    query += " ORDER BY id ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["active"] = bool(d["active"])
        result.append(d)
    return result

@router.get("/{seller_id}", response_model=SellerResponse)
def get_seller(seller_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sellers WHERE id = ?", (seller_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    
    d = dict(row)
    d["active"] = bool(d["active"])
    return d

@router.post("", response_model=SellerResponse)
def create_seller(seller: SellerCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM sellers WHERE code = ?", (seller.code,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Código de vendedor já existente")

    cursor.execute("""
    INSERT INTO sellers (
        name, code, phone, email, region, commission_rate, monthly_goal, current_sales, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        seller.name,
        seller.code,
        seller.phone,
        seller.email,
        seller.region,
        seller.commission_rate,
        seller.monthly_goal,
        seller.current_sales,
        1 if seller.active else 0
    ))
    seller_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM sellers WHERE id = ?", (seller_id,))
    new_seller = cursor.fetchone()
    conn.close()

    d = dict(new_seller)
    d["active"] = bool(d["active"])
    return d

@router.put("/{seller_id}", response_model=SellerResponse)
def update_seller(seller_id: int, seller: SellerUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM sellers WHERE id = ?", (seller_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")

    updates = []
    params = []
    for field, val in seller.dict(exclude_unset=True).items():
        if field == "active":
            updates.append("active = ?")
            params.append(1 if val else 0)
        else:
            updates.append(f"{field} = ?")
            params.append(val)

    if updates:
        params.append(seller_id)
        cursor.execute(f"UPDATE sellers SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()

    cursor.execute("SELECT * FROM sellers WHERE id = ?", (seller_id,))
    updated = cursor.fetchone()
    conn.close()

    d = dict(updated)
    d["active"] = bool(d["active"])
    return d

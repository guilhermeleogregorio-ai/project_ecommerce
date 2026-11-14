from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database.connection import tx
from models.core import Ctx, auditar

router = APIRouter(tags=["sellers"])

class SellerCreate(BaseModel):
    name: str
    code: str
    phone: str | None = None
    email: str | None = None
    region: str = "Ribeirão Preto e Região"
    commission_rate: float = 3.5
    monthly_goal: float = 50000.0

class SellerUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    phone: str | None = None
    email: str | None = None
    region: str | None = None
    commission_rate: float | None = None
    monthly_goal: float | None = None
    current_sales: float | None = None
    active: bool | None = None

@router.get("/sellers")
def list_sellers(active_only: bool = False):
    with tx() as conn:
        query = "SELECT * FROM sellers"
        if active_only:
            query += " WHERE active = 1"
        query += " ORDER BY name ASC"
        rows = conn.execute(query).fetchall()
        return [dict(r) for r in rows]

@router.get("/sellers/{seller_id}")
def get_seller(seller_id: int):
    with tx() as conn:
        row = conn.execute("SELECT * FROM sellers WHERE id = ?", (seller_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")
        return dict(row)

@router.post("/sellers", status_code=201)
def create_seller(data: SellerCreate):
    with tx() as conn:
        existing = conn.execute("SELECT * FROM sellers WHERE code = ?", (data.code,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Código de vendedor já cadastrado")
        
        cursor = conn.execute("""
        INSERT INTO sellers (name, code, phone, email, region, commission_rate, monthly_goal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (data.name, data.code, data.phone, data.email, data.region, data.commission_rate, data.monthly_goal))
        sid = cursor.lastrowid
        created = dict(conn.execute("SELECT * FROM sellers WHERE id = ?", (sid,)).fetchone())
        ctx = Ctx(loja_id=1)
        auditar(conn, ctx, "vendedor", sid, "criar", None, created)
        return created

@router.put("/sellers/{seller_id}")
def update_seller(seller_id: int, data: SellerUpdate):
    with tx() as conn:
        current = conn.execute("SELECT * FROM sellers WHERE id = ?", (seller_id,)).fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")
        
        updates = {}
        for k, v in data.model_dump(exclude_unset=True).items():
            if k == "active":
                updates["active"] = 1 if v else 0
            else:
                updates[k] = v
        
        if updates:
            sets = ", ".join(f"{k} = ?" for k in updates.keys())
            conn.execute(f"UPDATE sellers SET {sets} WHERE id = ?", (*updates.values(), seller_id))
        
        after = dict(conn.execute("SELECT * FROM sellers WHERE id = ?", (seller_id,)).fetchone())
        ctx = Ctx(loja_id=1)
        auditar(conn, ctx, "vendedor", seller_id, "atualizar", dict(current), after)
        return after

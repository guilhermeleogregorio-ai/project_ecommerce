from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database.connection import tx
from models.core import Ctx, auditar

router = APIRouter(tags=["customers"])

class CustomerCreate(BaseModel):
    name: str
    company_name: str | None = None
    document: str
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    number: str | None = None
    neighborhood: str | None = None
    city: str | None = "Ribeirão Preto"
    state: str | None = "SP"
    zip_code: str | None = None
    credit_limit: float = 5000.0

class CustomerUpdate(BaseModel):
    name: str | None = None
    company_name: str | None = None
    document: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    number: str | None = None
    neighborhood: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    credit_limit: float | None = None
    credit_used: float | None = None
    status: str | None = None

@router.get("/customers")
def list_customers(search: str | None = Query(None)):
    with tx() as conn:
        if search:
            s = f"%{search}%"
            rows = conn.execute("""
            SELECT * FROM customers 
            WHERE name LIKE ? OR company_name LIKE ? OR document LIKE ? OR phone LIKE ? OR email LIKE ?
            ORDER BY id DESC
            """, (s, s, s, s, s)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM customers ORDER BY id DESC").fetchall()
        return [dict(r) for r in rows]

@router.get("/customers/{customer_id}")
def get_customer(customer_id: int):
    with tx() as conn:
        row = conn.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        return dict(row)

@router.post("/customers", status_code=201)
def create_customer(data: CustomerCreate):
    with tx() as conn:
        existing = conn.execute("SELECT * FROM customers WHERE document = ?", (data.document,)).fetchone()
        if existing:
            # Idempotência de cliente por documento
            return dict(existing)
        
        cursor = conn.execute("""
        INSERT INTO customers 
        (name, company_name, document, email, phone, address, number, neighborhood, city, state, zip_code, credit_limit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.name, data.company_name, data.document, data.email, data.phone,
            data.address, data.number, data.neighborhood, data.city, data.state,
            data.zip_code, data.credit_limit
        ))
        cid = cursor.lastrowid
        created = dict(conn.execute("SELECT * FROM customers WHERE id = ?", (cid,)).fetchone())
        ctx = Ctx(loja_id=1)
        auditar(conn, ctx, "cliente", cid, "criar", None, created)
        return created

@router.put("/customers/{customer_id}")
def update_customer(customer_id: int, data: CustomerUpdate):
    with tx() as conn:
        current = conn.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)).fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        updates = data.model_dump(exclude_unset=True)
        if updates:
            sets = ", ".join(f"{k} = ?" for k in updates.keys())
            conn.execute(f"UPDATE customers SET {sets} WHERE id = ?", (*updates.values(), customer_id))
        
        after = dict(conn.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)).fetchone())
        ctx = Ctx(loja_id=1)
        auditar(conn, ctx, "cliente", customer_id, "atualizar", dict(current), after)
        return after

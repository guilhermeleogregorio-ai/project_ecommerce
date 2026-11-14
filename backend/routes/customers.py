from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

try:
    from backend.database.connection import get_db_connection
    from backend.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
except ImportError:
    from database.connection import get_db_connection
    from schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter(prefix="/api/customers", tags=["Clientes & Varejistas"])

@router.get("", response_model=List[CustomerResponse])
def get_customers(search: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()

    if search:
        term = f"%{search}%"
        cursor.execute("""
        SELECT * FROM customers 
        WHERE name LIKE ? OR company_name LIKE ? OR document LIKE ? OR city LIKE ?
        ORDER BY id DESC
        """, (term, term, term, term))
    else:
        cursor.execute("SELECT * FROM customers ORDER BY id DESC")

    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return dict(row)

@router.post("", response_model=CustomerResponse)
def create_customer(customer: CustomerCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM customers WHERE document = ?", (customer.document,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Já existe um cliente cadastrado com este CNPJ/CPF")

    cursor.execute("""
    INSERT INTO customers (
        name, company_name, document, email, phone, address, number,
        neighborhood, city, state, zip_code, credit_limit, credit_used, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        customer.name,
        customer.company_name,
        customer.document,
        customer.email,
        customer.phone,
        customer.address,
        customer.number,
        customer.neighborhood,
        customer.city,
        customer.state,
        customer.zip_code,
        customer.credit_limit,
        customer.credit_used,
        customer.status
    ))
    customer_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
    new_customer = cursor.fetchone()
    conn.close()
    return dict(new_customer)

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer: CustomerUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    updates = []
    params = []
    for field, val in customer.dict(exclude_unset=True).items():
        updates.append(f"{field} = ?")
        params.append(val)

    if updates:
        params.append(customer_id)
        cursor.execute(f"UPDATE customers SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()

    cursor.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
    updated = cursor.fetchone()
    conn.close()
    return dict(updated)

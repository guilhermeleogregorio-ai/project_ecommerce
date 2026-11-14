import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database.connection import tx
from models.core import Ctx, ErroNegocio, auditar
from models.estoque import registrar_movimento

router = APIRouter(tags=["orders"])

class OrderItemIn(BaseModel):
    product_id: int
    product_name: str
    product_sku: str | None = None
    unit_price: float
    quantity: int
    total_price: float
    image_url: str | None = None

class OrderCreate(BaseModel):
    customer_id: int | None = None
    customer_name: str
    customer_document: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    seller_id: int | None = None
    seller_name: str | None = None
    subtotal: float
    discount: float = 0.0
    shipping_fee: float = 0.0
    total: float
    payment_method: str = "PIX"
    coupon_code: str | None = None
    notes: str | None = None
    shipping_address: str | None = None
    items: list[OrderItemIn]

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/orders")
def list_orders(
    status: str | None = Query(None),
    customer_id: int | None = Query(None),
    seller_id: int | None = Query(None),
    search: str | None = Query(None)
):
    with tx() as conn:
        query = "SELECT * FROM orders WHERE 1=1"
        params = []

        if status and status != "ALL":
            query += " AND status = ?"
            params.append(status)

        if customer_id:
            query += " AND customer_id = ?"
            params.append(customer_id)

        if seller_id:
            query += " AND seller_id = ?"
            params.append(seller_id)

        if search:
            query += " AND (order_number LIKE ? OR customer_name LIKE ? OR customer_document LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s])

        query += " ORDER BY id DESC"
        orders = [dict(r) for r in conn.execute(query, params).fetchall()]

        # Anexa os itens em cada pedido
        for o in orders:
            items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (o["id"],)).fetchall()
            o["items"] = [dict(i) for i in items]

        return orders

@router.get("/orders/{order_id}")
def get_order(order_id: int):
    with tx() as conn:
        order = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        order_dict = dict(order)
        items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
        order_dict["items"] = [dict(i) for i in items]
        return order_dict

@router.post("/orders", status_code=201)
def create_order(data: OrderCreate):
    with tx() as conn:
        ctx = Ctx(loja_id=1)
        
        # 1. Garante ou localiza cliente
        cust_id = data.customer_id
        if not cust_id and data.customer_document:
            c_row = conn.execute("SELECT id FROM customers WHERE document = ?", (data.customer_document,)).fetchone()
            if c_row:
                cust_id = c_row["id"]
            else:
                c_cur = conn.execute("""
                INSERT INTO customers (name, document, phone, email, address)
                VALUES (?, ?, ?, ?, ?)
                """, (data.customer_name, data.customer_document, data.customer_phone, data.customer_email, data.shipping_address))
                cust_id = c_cur.lastrowid

        # 2. Gera número do pedido amigável (ex: SD-2026-XXXXX)
        order_number = f"SD-{datetime.now().year}-{secrets.token_hex(3).upper()}"
        
        # 3. Validação atômica e baixa de estoque
        for item in data.items:
            prod = conn.execute("SELECT * FROM products WHERE id = ?", (item.product_id,)).fetchone()
            if not prod:
                raise HTTPException(status_code=404, detail=f"Produto {item.product_name} não encontrado")
            if prod["stock"] < item.quantity:
                raise HTTPException(status_code=409, detail=f"Estoque insuficiente para '{prod['name']}'. Disponível: {prod['stock']}")

        # 4. Insere o pedido
        payment_status = "PAID" if data.payment_method in ("PIX", "CREDIT_CARD") else "PENDING"
        order_status = "APPROVED" if payment_status == "PAID" else "PENDING"
        
        cursor = conn.execute("""
        INSERT INTO orders (
            order_number, customer_id, customer_name, customer_document,
            customer_phone, customer_email, seller_id, seller_name,
            subtotal, discount, shipping_fee, total, payment_method,
            payment_status, status, coupon_code, notes, shipping_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_number, cust_id, data.customer_name, data.customer_document,
            data.customer_phone, data.customer_email, data.seller_id, data.seller_name,
            data.subtotal, data.discount, data.shipping_fee, data.total, data.payment_method,
            payment_status, order_status, data.coupon_code, data.notes, data.shipping_address
        ))
        order_id = cursor.lastrowid

        # 5. Insere itens e deduz estoque com histórico de movimentação
        for item in data.items:
            conn.execute("""
            INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, total_price, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (order_id, item.product_id, item.product_name, item.product_sku, item.unit_price, item.quantity, item.total_price, item.image_url))
            
            # Baixa atômica de estoque
            antes = conn.execute("SELECT stock FROM products WHERE id = ?", (item.product_id,)).fetchone()[0]
            depois = antes - item.quantity
            conn.execute("UPDATE products SET stock = ? WHERE id = ?", (depois, item.product_id))
            
            # Registra no livro de movimentação de estoque
            registrar_movimento(conn, ctx, item.product_id, order_id, "venda_pedido", "saida", item.quantity, antes, depois)

        # Atualiza vendas acumuladas do vendedor se houver
        if data.seller_id:
            conn.execute("UPDATE sellers SET current_sales = current_sales + ? WHERE id = ?", (data.total, data.seller_id))

        created = dict(conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone())
        created["items"] = [dict(i) for i in conn.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()]
        auditar(conn, ctx, "pedido", order_id, "criar", None, {"order_number": order_number, "total": data.total})
        return created

@router.patch("/orders/{order_id}/status")
def update_order_status(order_id: int, data: OrderStatusUpdate):
    with tx() as conn:
        current = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        conn.execute("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (data.status, order_id))
        
        ctx = Ctx(loja_id=1)
        auditar(conn, ctx, "pedido", order_id, "atualizar_status", {"status": current["status"]}, {"status": data.status})
        
        updated = dict(conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone())
        items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
        updated["items"] = [dict(i) for i in items]
        return updated

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import random

try:
    from backend.database.connection import get_db_connection
    from backend.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse, OrderItemResponse
except ImportError:
    from database.connection import get_db_connection
    from schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse, OrderItemResponse

router = APIRouter(prefix="/api/orders", tags=["Pedidos"])

def generate_order_number():
    year = datetime.now().year
    rand = random.randint(10000, 99999)
    return f"SD-{year}-{rand}"

@router.get("", response_model=List[OrderResponse])
def get_orders(
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    seller_id: Optional[int] = None,
    search: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()

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
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    order_rows = cursor.fetchall()

    orders_list = []
    for ord_row in order_rows:
        order_dict = dict(ord_row)
        cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_dict["id"],))
        items_rows = cursor.fetchall()
        order_dict["items"] = [dict(it) for it in items_rows]
        orders_list.append(order_dict)

    conn.close()
    return orders_list

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order_row = cursor.fetchone()
    if not order_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    order_dict = dict(order_row)
    cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    items_rows = cursor.fetchall()
    order_dict["items"] = [dict(it) for it in items_rows]
    conn.close()

    return order_dict

@router.post("", response_model=OrderResponse)
def create_order(order_data: OrderCreate):
    if not order_data.items:
        raise HTTPException(status_code=400, detail="O pedido deve conter pelo menos um item")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Valida regras de pedido mínimo das configurações
    cursor.execute("SELECT min_order_value FROM store_settings LIMIT 1")
    settings = cursor.fetchone()
    if settings and order_data.subtotal < settings["min_order_value"]:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"O valor mínimo para pedidos é de R$ {settings['min_order_value']:.2f}"
        )

    customer_id = order_data.customer_id
    if not customer_id and order_data.customer_document:
        cursor.execute("SELECT id FROM customers WHERE document = ?", (order_data.customer_document,))
        found_cust = cursor.fetchone()
        if found_cust:
            customer_id = found_cust["id"]
        else:
            cursor.execute("""
            INSERT INTO customers (name, document, phone, email, address, status)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE')
            """, (
                order_data.customer_name,
                order_data.customer_document,
                order_data.customer_phone,
                order_data.customer_email,
                order_data.shipping_address
            ))
            customer_id = cursor.lastrowid

    order_number = generate_order_number()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    payment_status = "PAID" if order_data.payment_method in ["CREDIT_CARD"] else "PENDING"
    initial_status = "SEPARATION" if payment_status == "PAID" else "PENDING"

    cursor.execute("""
    INSERT INTO orders (
        order_number, customer_id, customer_name, customer_document,
        customer_phone, customer_email, seller_id, seller_name,
        subtotal, discount, shipping_fee, total, payment_method,
        payment_status, status, coupon_code, notes, shipping_address,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order_number,
        customer_id,
        order_data.customer_name,
        order_data.customer_document,
        order_data.customer_phone,
        order_data.customer_email,
        order_data.seller_id,
        order_data.seller_name,
        order_data.subtotal,
        order_data.discount,
        order_data.shipping_fee,
        order_data.total,
        order_data.payment_method,
        payment_status,
        initial_status,
        order_data.coupon_code,
        order_data.notes,
        order_data.shipping_address,
        now_str,
        now_str
    ))
    order_id = cursor.lastrowid

    items_to_return = []
    for item in order_data.items:
        cursor.execute("""
        INSERT INTO order_items (
            order_id, product_id, product_name, product_sku,
            unit_price, quantity, total_price, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            item.product_id,
            item.product_name,
            item.product_sku,
            item.unit_price,
            item.quantity,
            item.total_price,
            item.image_url
        ))
        item_id = cursor.lastrowid
        items_to_return.append({
            "id": item_id,
            "order_id": order_id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "product_sku": item.product_sku,
            "unit_price": item.unit_price,
            "quantity": item.quantity,
            "total_price": item.total_price,
            "image_url": item.image_url
        })

        if item.product_id:
            cursor.execute(
                "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?",
                (item.quantity, item.product_id)
            )

    if order_data.seller_id:
        cursor.execute(
            "UPDATE sellers SET current_sales = current_sales + ? WHERE id = ?",
            (order_data.total, order_data.seller_id)
        )

    conn.commit()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    created_order = dict(cursor.fetchone())
    created_order["items"] = items_to_return
    conn.close()

    return created_order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, payload: OrderStatusUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    updates = ["updated_at = ?"]
    params = [datetime.now().strftime("%Y-%m-%d %H:%M:%S")]

    if payload.status:
        updates.append("status = ?")
        params.append(payload.status)
    if payload.payment_status:
        updates.append("payment_status = ?")
        params.append(payload.payment_status)
    if payload.notes is not None:
        updates.append("notes = ?")
        params.append(payload.notes)

    params.append(order_id)
    cursor.execute(f"UPDATE orders SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()

    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order_dict = dict(cursor.fetchone())
    cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    order_dict["items"] = [dict(it) for it in cursor.fetchall()]
    conn.close()

    return order_dict

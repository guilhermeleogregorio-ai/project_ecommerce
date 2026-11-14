from fastapi import APIRouter
from typing import Dict, Any, List

try:
    from backend.database.connection import get_db_connection
except ImportError:
    from database.connection import get_db_connection

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Métricas"])

@router.get("/metrics")
def get_dashboard_metrics() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COALESCE(SUM(total), 0) as total_sales FROM orders WHERE status != 'CANCELLED'")
    total_sales = float(cursor.fetchone()["total_sales"])

    cursor.execute("SELECT COUNT(*) as total_orders FROM orders")
    total_orders = int(cursor.fetchone()["total_orders"])

    average_ticket = round(total_sales / total_orders, 2) if total_orders > 0 else 0.0

    cursor.execute("SELECT COUNT(*) as total_customers FROM customers WHERE status = 'ACTIVE'")
    total_customers = int(cursor.fetchone()["total_customers"])

    cursor.execute("""
    SELECT status, COUNT(*) as count 
    FROM orders 
    GROUP BY status
    """)
    status_counts = {row["status"]: row["count"] for row in cursor.fetchall()}

    cursor.execute("""
    SELECT 
        oi.product_name, 
        oi.product_sku, 
        SUM(oi.quantity) as total_quantity, 
        SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status != 'CANCELLED'
    GROUP BY oi.product_name, oi.product_sku
    ORDER BY total_quantity DESC
    LIMIT 5
    """)
    top_products = [dict(r) for r in cursor.fetchall()]

    cursor.execute("""
    SELECT id, name, code, region, commission_rate, monthly_goal, current_sales
    FROM sellers
    WHERE active = 1
    ORDER BY current_sales DESC
    """)
    top_sellers = [dict(r) for r in cursor.fetchall()]

    cursor.execute("""
    SELECT id, name, sku, stock, min_quantity, unit
    FROM products
    WHERE stock <= 85 AND is_active = 1
    ORDER BY stock ASC
    LIMIT 5
    """)
    low_stock = [dict(r) for r in cursor.fetchall()]

    cursor.execute("""
    SELECT id, order_number, customer_name, total, payment_method, payment_status, status, created_at
    FROM orders
    ORDER BY id DESC
    LIMIT 6
    """)
    recent_orders = [dict(r) for r in cursor.fetchall()]

    sales_timeline = [
        {"day": "08/11", "total": 1250.0, "pedidos": 3},
        {"day": "09/11", "total": 1840.5, "pedidos": 4},
        {"day": "10/11", "total": 2100.0, "pedidos": 5},
        {"day": "11/11", "total": 1650.0, "pedidos": 3},
        {"day": "12/11", "total": 2980.0, "pedidos": 6},
        {"day": "13/11", "total": 3420.0, "pedidos": 7},
        {"day": "14/11", "total": total_sales, "pedidos": total_orders}
    ]

    conn.close()

    return {
        "kpis": {
            "total_sales": total_sales,
            "total_orders": total_orders,
            "average_ticket": average_ticket,
            "total_customers": total_customers
        },
        "status_counts": status_counts,
        "top_products": top_products,
        "top_sellers": top_sellers,
        "low_stock_alerts": low_stock,
        "recent_orders": recent_orders,
        "sales_timeline": sales_timeline
    }

from fastapi import APIRouter
from database.connection import tx

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard/metrics")
def get_dashboard_metrics():
    with tx() as conn:
        # 1. Totalizadores gerais
        orders_row = conn.execute("""
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total), 0.0) as total_revenue,
            COALESCE(AVG(total), 0.0) as avg_ticket
        FROM orders
        """).fetchone()

        pending_row = conn.execute("SELECT COUNT(*) FROM orders WHERE status = 'PENDING'").fetchone()
        customers_row = conn.execute("SELECT COUNT(*) FROM customers WHERE status = 'ACTIVE'").fetchone()
        low_stock_row = conn.execute("SELECT COUNT(*) FROM products WHERE stock <= 15 AND is_active = 1").fetchone()

        kpis = {
            "total_sales": round(orders_row["total_revenue"], 2),
            "orders_count": orders_row["total_orders"],
            "average_ticket": round(orders_row["avg_ticket"], 2),
            "pending_orders": pending_row[0],
            "active_customers": customers_row[0],
            "low_stock_count": low_stock_row[0]
        }

        # 2. Status counts
        status_rows = conn.execute("SELECT status, COUNT(*) as count FROM orders GROUP BY status").fetchall()
        status_counts = {r["status"]: r["count"] for r in status_rows}

        # 3. Produtos mais vendidos
        top_prods_rows = conn.execute("""
        SELECT 
            oi.product_name, 
            oi.product_sku, 
            SUM(oi.quantity) as total_qty, 
            SUM(oi.total_price) as total_amount
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        GROUP BY oi.product_id
        ORDER BY total_qty DESC
        LIMIT 5
        """).fetchall()
        top_products = [dict(r) for r in top_prods_rows]

        # 4. Top vendedores
        top_sellers_rows = conn.execute("""
        SELECT id, name, code, region, current_sales, monthly_goal,
               ROUND((current_sales / NULLIF(monthly_goal, 0)) * 100, 1) as goal_reached_percent
        FROM sellers
        WHERE active = 1
        ORDER BY current_sales DESC
        LIMIT 5
        """).fetchall()
        top_sellers = [dict(r) for r in top_sellers_rows]

        # 5. Alertas de estoque baixo
        low_stock_prods = conn.execute("""
        SELECT id, name, sku, stock, min_quantity, category_name
        FROM products
        WHERE stock <= 15 AND is_active = 1
        ORDER BY stock ASC
        LIMIT 6
        """).fetchall()
        low_stock_alerts = [dict(r) for r in low_stock_prods]

        # 6. Pedidos recentes
        recent_rows = conn.execute("""
        SELECT id, order_number, customer_name, total, payment_method, status, created_at
        FROM orders
        ORDER BY id DESC
        LIMIT 6
        """).fetchall()
        recent_orders = [dict(r) for r in recent_rows]

        # 7. Timeline simplificada de vendas
        timeline_rows = conn.execute("""
        SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total) as amount
        FROM orders
        GROUP BY DATE(created_at)
        ORDER BY date ASC
        LIMIT 7
        """).fetchall()
        sales_timeline = [dict(r) for r in timeline_rows]

        return {
            "kpis": kpis,
            "status_counts": status_counts,
            "top_products": top_products,
            "top_sellers": top_sellers,
            "low_stock_alerts": low_stock_alerts,
            "recent_orders": recent_orders,
            "sales_timeline": sales_timeline
        }

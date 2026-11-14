from .products import router as products_router
from .customers import router as customers_router
from .sellers import router as sellers_router
from .orders import router as orders_router
from .settings import router as settings_router
from .dashboard import router as dashboard_router

__all__ = [
    "products_router",
    "customers_router",
    "sellers_router",
    "orders_router",
    "settings_router",
    "dashboard_router"
]

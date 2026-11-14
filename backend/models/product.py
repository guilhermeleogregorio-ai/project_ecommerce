from dataclasses import dataclass
from typing import Optional

@dataclass
class Product:
    id: Optional[int]
    name: str
    sku: str
    category_id: Optional[int]
    category_name: Optional[str]
    description: Optional[str]
    price: float
    promo_price: Optional[float]
    unit: str
    min_quantity: int
    box_quantity: int
    stock: int
    image_url: Optional[str]
    is_active: bool
    featured: bool
    created_at: Optional[str] = None

@dataclass
class Category:
    id: Optional[int]
    name: str
    slug: str
    description: Optional[str]
    icon: Optional[str]

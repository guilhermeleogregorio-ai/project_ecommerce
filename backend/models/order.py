from dataclasses import dataclass
from typing import Optional, List

@dataclass
class OrderItem:
    id: Optional[int]
    order_id: int
    product_id: Optional[int]
    product_name: str
    product_sku: Optional[str]
    unit_price: float
    quantity: int
    total_price: float
    image_url: Optional[str]

@dataclass
class Order:
    id: Optional[int]
    order_number: str
    customer_id: Optional[int]
    customer_name: str
    customer_document: Optional[str]
    customer_phone: Optional[str]
    customer_email: Optional[str]
    seller_id: Optional[int]
    seller_name: Optional[str]
    subtotal: float
    discount: float
    shipping_fee: float
    total: float
    payment_method: str
    payment_status: str
    status: str
    coupon_code: Optional[str]
    notes: Optional[str]
    shipping_address: Optional[str]
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    items: Optional[List[OrderItem]] = None

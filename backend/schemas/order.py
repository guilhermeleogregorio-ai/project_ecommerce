from pydantic import BaseModel, Field
from typing import Optional, List

class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    product_sku: Optional[str] = None
    unit_price: float
    quantity: int = Field(..., gt=0)
    total_price: float
    image_url: Optional[str] = None

class OrderItemResponse(OrderItemCreate):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: str
    customer_document: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    seller_id: Optional[int] = None
    seller_name: Optional[str] = None
    subtotal: float
    discount: float = 0.0
    shipping_fee: float = 0.0
    total: float
    payment_method: str = Field("PIX", description="PIX, BOLETO, CREDIT_CARD")
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    shipping_address: Optional[str] = None
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: Optional[str] = None # PENDING, APPROVED, SEPARATION, BILLED, DELIVERED, CANCELLED
    payment_status: Optional[str] = None # PENDING, PAID, CANCELLED
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: Optional[int] = None
    customer_name: str
    customer_document: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    seller_id: Optional[int] = None
    seller_name: Optional[str] = None
    subtotal: float
    discount: float
    shipping_fee: float
    total: float
    payment_method: str
    payment_status: str
    status: str
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    shipping_address: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

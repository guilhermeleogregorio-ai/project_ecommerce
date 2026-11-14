from pydantic import BaseModel, Field
from typing import Optional

class StoreSettingsBase(BaseModel):
    store_name: str = Field(..., description="Nome da loja/distribuidora")
    trade_name: Optional[str] = None
    cnpj: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    min_order_value: float = Field(0.0, description="Valor mínimo do pedido")
    pix_discount_percent: float = Field(5.0, description="Desconto à vista no PIX")
    enable_boleto: bool = True
    boleto_terms_days: int = 30
    free_shipping_min: float = 300.0

class StoreSettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    trade_name: Optional[str] = None
    cnpj: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    min_order_value: Optional[float] = None
    pix_discount_percent: Optional[float] = None
    enable_boleto: Optional[bool] = None
    boleto_terms_days: Optional[int] = None
    free_shipping_min: Optional[float] = None

class StoreSettingsResponse(StoreSettingsBase):
    id: int
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    code: str
    subtotal: float

class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount: float
    message: str

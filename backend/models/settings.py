from dataclasses import dataclass
from typing import Optional

@dataclass
class StoreSettings:
    id: Optional[int]
    store_name: str
    trade_name: Optional[str]
    cnpj: Optional[str]
    phone: Optional[str]
    whatsapp: Optional[str]
    email: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    min_order_value: float = 0.0
    pix_discount_percent: float = 5.0
    enable_boleto: bool = True
    boleto_terms_days: int = 30
    free_shipping_min: float = 300.0
    updated_at: Optional[str] = None

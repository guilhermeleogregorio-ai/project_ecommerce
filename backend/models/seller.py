from dataclasses import dataclass
from typing import Optional

@dataclass
class Seller:
    id: Optional[int]
    name: str
    code: str
    phone: Optional[str]
    email: Optional[str]
    region: Optional[str]
    commission_rate: float = 3.5
    monthly_goal: float = 50000.0
    current_sales: float = 0.0
    active: bool = True
    created_at: Optional[str] = None

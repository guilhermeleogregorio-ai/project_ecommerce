from dataclasses import dataclass
from typing import Optional

@dataclass
class Customer:
    id: Optional[int]
    name: str
    company_name: Optional[str]
    document: str
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    number: Optional[str]
    neighborhood: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    credit_limit: float = 5000.0
    credit_used: float = 0.0
    status: str = "ACTIVE"
    created_at: Optional[str] = None

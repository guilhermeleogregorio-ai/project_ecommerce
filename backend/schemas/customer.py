from pydantic import BaseModel, Field
from typing import Optional

class CustomerBase(BaseModel):
    name: str = Field(..., description="Nome de contato ou fantasia")
    company_name: Optional[str] = Field(None, description="Razão Social")
    document: str = Field(..., description="CNPJ ou CPF")
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    number: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    credit_limit: float = 5000.0
    credit_used: float = 0.0
    status: str = "ACTIVE"

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    document: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    number: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    credit_limit: Optional[float] = None
    credit_used: Optional[float] = None
    status: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from typing import Optional

class SellerBase(BaseModel):
    name: str = Field(..., description="Nome do vendedor/representante")
    code: str = Field(..., description="Código do representante ex: REP-101")
    phone: Optional[str] = None
    email: Optional[str] = None
    region: Optional[str] = None
    commission_rate: float = Field(3.5, description="Percentual de comissão")
    monthly_goal: float = Field(50000.0, description="Meta mensal em reais")
    current_sales: float = Field(0.0, description="Total vendido no mês atual")
    active: bool = True

class SellerCreate(SellerBase):
    pass

class SellerUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    region: Optional[str] = None
    commission_rate: Optional[float] = None
    monthly_goal: Optional[float] = None
    current_sales: Optional[float] = None
    active: Optional[bool] = None

class SellerResponse(SellerBase):
    id: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

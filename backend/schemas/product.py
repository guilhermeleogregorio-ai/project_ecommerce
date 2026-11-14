from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., description="Nome do produto")
    sku: str = Field(..., description="Código de referência/SKU")
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Preço de tabela")
    promo_price: Optional[float] = Field(None, description="Preço promocional")
    unit: str = Field("UN", description="Unidade de medida: UN, CX, FD, DP, KG")
    min_quantity: int = Field(1, ge=1, description="Quantidade mínima para pedido")
    box_quantity: int = Field(1, ge=1, description="Quantidade por embalagem fechada")
    stock: int = Field(0, ge=0, description="Saldo em estoque")
    image_url: Optional[str] = None
    is_active: bool = True
    featured: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    promo_price: Optional[float] = None
    unit: Optional[str] = None
    min_quantity: Optional[int] = None
    box_quantity: Optional[int] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    featured: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

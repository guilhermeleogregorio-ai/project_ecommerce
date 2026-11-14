from pydantic import BaseModel, Field

class ProdutoIn(BaseModel):
    nome: str
    preco_centavos: int = Field(ge=0)
    sku: str | None = None
    descricao: str | None = None
    categoria_id: int | None = None
    estoque_atual: int = Field(0, ge=0)
    estoque_minimo: int = Field(0, ge=0)

class ProdutoPatch(BaseModel):
    nome: str | None = None
    preco_centavos: int | None = Field(None, ge=0)
    descricao: str | None = None
    estoque_minimo: int | None = Field(None, ge=0)
    ativo: int | None = None
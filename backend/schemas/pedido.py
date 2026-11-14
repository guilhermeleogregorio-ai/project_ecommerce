from pydantic import BaseModel, Field

class Item(BaseModel):
    produto_id: int
    quantidade: int = Field(gt=0)

class PedidoIn(BaseModel):
    cliente_id: int
    itens: list[Item]

    
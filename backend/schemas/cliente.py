from pydantic import BaseModel

class ClienteIn(BaseModel):
    nome: str
    telefone: str | None = None
    email: str | None = None
    
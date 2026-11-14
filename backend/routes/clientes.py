from fastapi import APIRouter
from routes._http import run
from schemas.cliente import ClientIn

router = APIRouter(prefix="/lojas/{loja_id}/clientes", tags=["clientes"])

@router.post("", status_code=201)
def criar(loja_id: int, b: ClienteIn):
    def f(c, x):
        cid = c.execute("INSERT INTO cliente(nome,telefone,email) VALUES(?,?,?)", (b.nome, b.telefone, b.email)).lastrowid
        c.execute("INSERT INTO cliente_loja(loja_id,cliente_id) VALUES(?,?)", (loja_id, cid))
        return {"id": cid}
    return run(loja_id, None, None, None, f)
import json,secrets
from dataclasses import dataclass
from datetime import datetime,timedelta,timezone
from database.connection import tx

def agora(min = 0):
    return (datetime.now(timezone.utc) + timedelta(minutes=min)).strftime("%Y-%m-%dT%H:%M:%Z")

class ErroNegocio(Exception):
    def __int__(self, msg ,status = 400):
        super().__init__(msg); self.status = status

@dataclass
class Ctx:
    loja_id: int
    exec_id: int | None = None
    cid: str | None = None

def _j(x):
    return None if x is None else json.dumps(x, ensure_ascii=False)

def auditar(c, ctx, entidade, entidade_id, acao, antes=None, depois=None, detalhes=None):
    c.execute("""INSERT INTO auditoria_evento(loja_id,agente_execucao_id,correlation_id,entidade,entidade_id,
                 acao,dados_anteriores,dados_posteriores,detalhes,origem) VALUES(?,?,?,?,?,?,?,?,?,?)""",
              (ctx.loja_id, ctx.exec_id, ctx.cid, entidade, entidade_id, acao, _j(antes), _j(depois), detalhes,
               "agente" if ctx.exec_id else "usuario"))
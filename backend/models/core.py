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


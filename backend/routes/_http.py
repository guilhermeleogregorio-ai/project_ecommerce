import sqlite3
from fastapi import HTTPException
from models.core import ErroNegocio, executar

def run(loja_id, agente, cid, body, fn):
    """Executa fn numa transação; traduz erros de negócio/DB em HTTP e registra execução de agente."""
    try:
        return executar(loja_id, agente, cid, body, fn)
    except ErroNegocio as e:
        raise HTTPException(e.status, str(e))
    except sqlite3.IntegrityError as e:
        raise HTTPException(409, f"Violação de regra: {e}")

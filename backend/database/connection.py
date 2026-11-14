import os, sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = os.getenv("DB_PATH") or os.path.join(os.path.dirname(__file__), "loja.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def connect():
    c = sqlite3.connect(DB_PATH, isolation_level=None)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys=ON")
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA busy_timeout=5000")
    return c 

def init_db():
    c = connect()
    # Executa o schema.sql que define a arquitetura oficial do desafio
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            c.executescript(f.read())
    c.close()

@contextmanager
def tx():
    """
    Transação com BEGIN IMMEDIATE: serializa escritores no SQLite.
    Garante atomicidade e evita race condition entre venda do balcão e online.
    """
    c = connect()
    c.execute("BEGIN IMMEDIATE")
    try:
        yield c
        c.execute("COMMIT")
    except BaseException:
        c.execute("ROLLBACK")
        raise
    finally:
        c.close()

import os, sqlite3
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH"), os.path.join(os.path.dirname(__file__), "loja.db")
SCHEMA = os.path.join(os.path.dirname(__file__), "schema.sql")

def connect():
    c = sqlite3.connect(DB_PATH, isolation_level=None) # transações manuais
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreing_keys=ON")
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA busy_timeout=5000")
    return c 


def init_db():


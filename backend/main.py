import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import init_db, tx
from models.core import Ctx
from models.pedido import expirar_pedidos
from routes import clientes, pedidos, produtos

@asynccontextmanager
async def lifespan(app):
    init_db()
    async def expirador():
        while True:
            await asyncio.sleep(60)
            with tx() as c:
                expirar_pedidos(c, Ctx(0))
    t = asyncio.create_task(expirador())
    yield
    t.cancel()

app = FastAPI(title="Varejo Local API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://localhost:3000"],
                   allow_methods=["*"], allow_headers=["*"])
for r in (produtos.router, clientes.router, pedidos.router):
    app.include_router(r)

import asyncio
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import init_db, tx
from database.seed_data import seed
from models.core import Ctx
from models.pedidos import expirar_pedidos
from routes import products, orders, agentes, dashboard, settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Executa schema.sql oficial do desafio
    init_db()
    # 2. Popula dados de demonstração (Plataforma multi-loja ajustável)
    seed()
    
    # 3. Rotina assíncrona periódica: libera reservas vencidas
    async def rotina_expiracao():
        while True:
            await asyncio.sleep(60)
            try:
                with tx() as conn:
                    expirar_pedidos(conn, Ctx(loja_id=1))
            except Exception:
                pass
                
    tarefa = asyncio.create_task(rotina_expiracao())
    yield
    tarefa.cancel()

app = FastAPI(
    title="Salesdrive - Plataforma de Varejo Local Inteligente API",
    description="Backend oficial Salesdrive focado na primeira venda digital do varejo físico, rotina do balcão e agentes de IA",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas sob o prefixo /api
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(agentes.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(settings.router, prefix="/api")

@app.get("/")
def raiz():
    return {
        "status": "online",
        "projeto": "Tray E-commerce - Desafio Varejo Local",
        "empresa": "Salesdrive Mercearia & Loja Central",
        "documentacao": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

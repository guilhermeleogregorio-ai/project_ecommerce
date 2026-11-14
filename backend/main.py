import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Garante que o diretório backend esteja no sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import init_db
from database.seed_data import seed
from routes import products, customers, sellers, orders, settings, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed()
    yield

app = FastAPI(title="Salesdrive Varejo Local API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra todos os módulos de rotas sob o prefixo /api
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(sellers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "online", "message": "API Salesdrive Varejo Local operacional", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

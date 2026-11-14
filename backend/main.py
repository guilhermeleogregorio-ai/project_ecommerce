import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Garante inclusão do diretório backend no PATH do Python
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from database.connection import init_db
from database.seed_data import seed
from routes.products import router as products_router
from routes.customers import router as customers_router
from routes.sellers import router as sellers_router
from routes.orders import router as orders_router
from routes.settings import router as settings_router
from routes.dashboard import router as dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialização do banco e seed inicial
    init_db()
    seed()
    yield

app = FastAPI(
    title="Salesdrive - API de E-commerce & Força de Vendas",
    description="API RESTful de suporte ao MVP do Salesdrive (Salespace) para compradores e administradores.",
    version="1.0.0",
    lifespan=lifespan
)

# Configuração de CORS para permitir acesso irrestrito do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de Rotas
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(sellers_router)
app.include_router(orders_router)
app.include_router(settings_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Salesdrive E-commerce & B2B API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

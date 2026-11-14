from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from database.connection import tx
from models.core import Ctx
from models.produto import criar_produto, atualizar_produto

router = APIRouter(tags=["produtos"])

class ProdutoCreateIn(BaseModel):
    nome: str
    sku: str | None = None
    preco: float = Field(gt=0, description="Preço em reais (ex: 28.90)")
    estoque_atual: int = 0
    local_fisico: str | None = "Balcão / Prateleira"
    imagem_url: str | None = None

class ProdutoUpdateIn(BaseModel):
    nome: str | None = None
    sku: str | None = None
    preco: float | None = None
    estoque_atual: int | None = None
    local_fisico: str | None = None
    imagem_url: str | None = None
    ativo: int | None = None

def formatar_produto(p):
    saldo_livre = p["estoque_atual"] - p["estoque_reservado"]
    return {
        "id": p["id"],
        "loja_id": p["loja_id"],
        "name": p["nome"],
        "nome": p["nome"],
        "sku": p["sku"],
        "price": p["preco_centavos"] / 100.0,
        "preco_centavos": p["preco_centavos"],
        "stock": p["estoque_atual"],
        "estoque_atual": p["estoque_atual"],
        "estoque_reservado": p["estoque_reservado"],
        "saldo_livre": saldo_livre,
        "local_fisico": p["local_fisico"],
        "image_url": p["imagem_url"] or "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        "imagem_url": p["imagem_url"],
        "is_active": bool(p["ativo"]),
        "ativo": p["ativo"]
    }

@router.get("/categories")
def listar_categorias():
    return [
        {"id": 1, "name": "Escolar & Universitário", "slug": "escolar"},
        {"id": 2, "name": "Escrita & Canetas", "slug": "escrita"},
        {"id": 3, "name": "Papéis & Sulfite", "slug": "papeis"},
        {"id": 4, "name": "Mochilas & Estojos", "slug": "mochilas"},
        {"id": 5, "name": "Acessórios de Balcão", "slug": "balcao"}
    ]

@router.get("/products")
def listar_produtos(
    search: str | None = None,
    active_only: bool | None = None,
    loja_id: int = 1
):
    with tx() as conn:
        query = "SELECT * FROM produto WHERE loja_id = ?"
        params = [loja_id]

        if active_only:
            query += " AND ativo = 1"

        if search:
            query += " AND (nome LIKE ? OR sku LIKE ? OR local_fisico LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s])

        query += " ORDER BY id DESC"
        rows = conn.execute(query, params).fetchall()
        return [formatar_produto(dict(r)) for r in rows]

@router.get("/products/{product_id}")
def obter_produto(product_id: int, loja_id: int = 1):
    with tx() as conn:
        row = conn.execute("SELECT * FROM produto WHERE id = ? AND loja_id = ?", (product_id, loja_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        return formatar_produto(dict(row))

@router.post("/products", status_code=201)
def cadastrar_produto(data: ProdutoCreateIn, loja_id: int = 1):
    with tx() as conn:
        ctx = Ctx(loja_id=loja_id)
        d = {
            "nome": data.nome,
            "sku": data.sku or f"PAP-{data.nome[:4].upper()}",
            "preco_centavos": int(round(data.preco * 100)),
            "estoque_atual": data.estoque_atual,
            "local_fisico": data.local_fisico,
            "imagem_url": data.imagem_url
        }
        prod = criar_produto(conn, ctx, d)
        return formatar_produto(prod)

@router.put("/products/{product_id}")
def alterar_produto(product_id: int, data: ProdutoUpdateIn, loja_id: int = 1):
    with tx() as conn:
        ctx = Ctx(loja_id=loja_id)
        campos = {}
        if data.nome is not None: campos["nome"] = data.nome
        if data.sku is not None: campos["sku"] = data.sku
        if data.preco is not None: campos["preco_centavos"] = int(round(data.preco * 100))
        if data.estoque_atual is not None: campos["estoque_atual"] = data.estoque_atual
        if data.local_fisico is not None: campos["local_fisico"] = data.local_fisico
        if data.imagem_url is not None: campos["imagem_url"] = data.imagem_url
        if data.ativo is not None: campos["ativo"] = data.ativo

        prod = atualizar_produto(conn, ctx, product_id, campos)
        return formatar_produto(prod)

@router.delete("/products/{product_id}")
def desativar_produto(product_id: int, loja_id: int = 1):
    with tx() as conn:
        ctx = Ctx(loja_id=loja_id)
        prod = atualizar_produto(conn, ctx, product_id, {"ativo": 0})
        return {"success": True, "message": "Produto desativado do catálogo"}

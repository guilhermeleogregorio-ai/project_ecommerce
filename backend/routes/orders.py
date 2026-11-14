from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database.connection import tx
from models.core import Ctx
from models.pedidos import (
    criar_pedido,
    confirmar_pagamento,
    separar_pedido,
    concluir_retirada,
    registrar_venda_balcao
)

router = APIRouter(tags=["pedidos"])

class ItemPedidoIn(BaseModel):
    product_id: int
    quantity: int

class PedidoCheckoutIn(BaseModel):
    customer_name: str
    customer_email: str | None = "cliente@loja.com"
    customer_phone: str | None = None
    tipo_entrega: str = "retirada"
    cep_destino: str | None = None
    payment_method: str = "PIX"
    items: list[ItemPedidoIn]

class VendaBalcaoIn(BaseModel):
    items: list[ItemPedidoIn]

class RetiradaBalcaoIn(BaseModel):
    codigo_retirada: str

def formatar_pedido(p, conn):
    items_rows = conn.execute("SELECT * FROM pedido_item WHERE pedido_id = ?", (p["id"],)).fetchall()
    itens = []
    for it in items_rows:
        itens.append({
            "id": it["id"],
            "product_id": it["produto_id"],
            "product_name": it["nome_snapshot"],
            "quantity": it["quantidade"],
            "unit_price": it["preco_unit_centavos"] / 100.0,
            "total_price": (it["preco_unit_centavos"] * it["quantidade"]) / 100.0
        })

    cli = conn.execute("SELECT * FROM cliente WHERE id = ?", (p["cliente_id"],)).fetchone()
    cliente_nome = cli["nome"] if cli else "Consumidor Balcão"
    cliente_telefone = cli["telefone"] if cli else ""

    return {
        "id": p["id"],
        "order_number": f"PED-{p['id']:04d}",
        "customer_name": cliente_nome,
        "customer_phone": cliente_telefone,
        "tipo_entrega": p["tipo_entrega"],
        "status": p["status"],
        "subtotal": p["subtotal_centavos"] / 100.0,
        "frete": p["frete_centavos"] / 100.0,
        "total": p["total_centavos"] / 100.0,
        "codigo_retirada": p["codigo_retirada"],
        "criado_em": p["criado_em"],
        "expira_em": p["expira_em"],
        "items": itens
    }

@router.get("/orders")
def listar_pedidos(
    status: str | None = None,
    tipo_entrega: str | None = None,
    codigo_retirada: str | None = None,
    loja_id: int = 1
):
    with tx() as conn:
        query = "SELECT * FROM pedido WHERE loja_id = ?"
        params = [loja_id]

        if status and status != "ALL":
            query += " AND status = ?"
            params.append(status)

        if tipo_entrega:
            query += " AND tipo_entrega = ?"
            params.append(tipo_entrega)

        if codigo_retirada:
            query += " AND codigo_retirada = ?"
            params.append(codigo_retirada.strip().upper())

        query += " ORDER BY id DESC"
        rows = conn.execute(query, params).fetchall()
        return [formatar_pedido(dict(r), conn) for r in rows]

@router.get("/orders/{order_id}")
def obter_pedido(order_id: int, loja_id: int = 1):
    with tx() as conn:
        row = conn.execute("SELECT * FROM pedido WHERE id = ? AND loja_id = ?", (order_id, loja_id)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        return formatar_pedido(dict(row), conn)

@router.post("/orders", status_code=201)
def criar_pedido_online(data: PedidoCheckoutIn, loja_id: int = 1):
    with tx() as conn:
        ctx = Ctx(loja_id=loja_id)
        
        cli = None
        if data.customer_email:
            cli = conn.execute("SELECT id FROM cliente WHERE email = ?", (data.customer_email,)).fetchone()
        
        if cli:
            cliente_id = cli["id"]
        else:
            cur = conn.execute("""
                INSERT INTO cliente (nome, email, telefone, senha_hash, endereco)
                VALUES (?, ?, ?, 'hash_simulado', ?)
            """, (data.customer_name, data.customer_email, data.customer_phone, data.cep_destino or "Retirada"))
            cliente_id = cur.lastrowid

        itens = [{"produto_id": it.product_id, "quantidade": it.quantity} for it in data.items]
        ped = criar_pedido(conn, ctx, cliente_id, itens, tipo_entrega=data.tipo_entrega, cep_destino=data.cep_destino)
        
        confirmar_pagamento(conn, ctx, ped["id"], metodo=data.payment_method.lower())
        
        ped_atualizado = dict(conn.execute("SELECT * FROM pedido WHERE id = ?", (ped["id"],)).fetchone())
        return formatar_pedido(ped_atualizado, conn)

@router.patch("/orders/{order_id}/status")
def atualizar_status_pedido(order_id: int, payload: dict, loja_id: int = 1):
    with tx() as conn:
        ctx = Ctx(loja_id=loja_id)
        novo_status = payload.get("status")
        if novo_status == "separado":
            separar_pedido(conn, ctx, order_id)
        elif novo_status in ("pago", "aguardando_pagamento", "concluido", "cancelado"):
            conn.execute("UPDATE pedido SET status = ? WHERE id = ? AND loja_id = ?", (novo_status, order_id, loja_id))
        else:
            raise HTTPException(status_code=400, detail="Status inválido")

        ped = dict(conn.execute("SELECT * FROM pedido WHERE id = ?", (order_id,)).fetchone())
        return formatar_pedido(ped, conn)

@router.post("/balcao/venda")
def registrar_venda_presencial(data: VendaBalcaoIn, loja_id: int = 1):
    with tx() as conn:
        ctx = Ctx(loja_id=loja_id)
        itens = [{"produto_id": it.product_id, "quantidade": it.quantity} for it in data.items]
        res = registrar_venda_balcao(conn, ctx, itens)
        return res

@router.post("/balcao/retirar")
def concluir_retirada_balcao(data: RetiradaBalcaoIn, loja_id: int = 1):
    with tx() as conn:
        ctx = Ctx(loja_id=loja_id)
        res = concluir_retirada(conn, ctx, data.codigo_retirada)
        return res

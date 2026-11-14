import secrets
from models.core import Ctx, ErroNegocio, agora,auditar
from models.estoque import registrar_movimento

RESERVA_MIN = 15

#Pedidos
def criar_pedido(c, ctx, cliente_id, itens, chave=None):
    if chave:
        ex = c.execute("SELECT * FROM pedido WHERE loja_id=? AND chave_idempotencia=?", (ctx.loja_id, chave)).fetchone()
        if ex: return dict(ex)  # idempotente: mesma chave = mesmo pedido
    if not c.execute("SELECT 1 FROM cliente WHERE id=?", (cliente_id,)).fetchone():
        raise ErroNegocio("Cliente não encontrado", 404)
    c.execute("INSERT OR IGNORE INTO cliente_loja(loja_id,cliente_id) VALUES(?,?)", (ctx.loja_id, cliente_id))
    qtds = {}
    for i in itens: qtds[i["produto_id"]] = qtds.get(i["produto_id"], 0) + i["quantidade"]
    if not qtds: raise ErroNegocio("Pedido sem itens")
    exp = agora(RESERVA_MIN)
    pedido_id = c.execute("""INSERT INTO pedido(loja_id,cliente_id,codigo_retirada,chave_idempotencia,total_centavos,canal,expira_em)
        VALUES(?,?,?,?,0,'online',?)""", (ctx.loja_id, cliente_id, secrets.token_hex(3).upper(), chave, exp)).lastrowid
    total = 0
    for pid, q in qtds.items():
        p = c.execute("SELECT * FROM produto WHERE id=? AND loja_id=? AND ativo=1", (pid, ctx.loja_id)).fetchone()
        if not p: raise ErroNegocio(f"Produto {pid} indisponível", 404)
        # reserva atômica: só reserva se houver saldo livre
        r = c.execute("""UPDATE produto SET estoque_reservado=estoque_reservado+?, atualizado_em=?
                         WHERE id=? AND estoque_atual-estoque_reservado>=?""", (q, agora(), pid, q))
        if r.rowcount == 0: raise ErroNegocio(f"Sem estoque para '{p['nome']}'", 409)  # rollback total
        item_id = c.execute("""INSERT INTO pedido_item(loja_id,pedido_id,produto_id,quantidade,preco_unit_centavos,
            produto_nome_snapshot,produto_sku_snapshot) VALUES(?,?,?,?,?,?,?)""",
            (ctx.loja_id, pedido_id, pid, q, p["preco_centavos"], p["nome"], p["sku"])).lastrowid
        c.execute("INSERT INTO reserva_estoque(loja_id,pedido_item_id,quantidade,expira_em) VALUES(?,?,?,?)",
                  (ctx.loja_id, item_id, q, exp))
        total += q * p["preco_centavos"]
    c.execute("UPDATE pedido SET total_centavos=? WHERE id=?", (total, pedido_id))
    ped = dict(c.execute("SELECT * FROM pedido WHERE id=?", (pedido_id,)).fetchone())
    auditar(c, ctx, "pedido", pedido_id, "criar", None, ped)
    return ped

def _pedido(c, ctx , pedido_id , status_ok):
    p = c.execute("SELECT * FROM pedido WHERE id =? AND  loja_id?", (pedido_id,ctx.loja_id)).fetchone()
    if not p: raise ErroNegocio("Pedido não encontrado", 404)
    if p["status"] not in status_ok: raise ErroNegocio(f"Status '{p['status']}' não permite esta ação", 409)
    return p

def confirmar_pedido(c, ctx, pedido_id):
    _pedido(c, ctx, pedido_id, ("aguardando_pagamento",))
    c.execute("UPDATE pedido SET status='confirmado',confirmado_em=?,atualizado_em=? WHERE id=?", (agora(), agora(), pedido_id))
    auditar(c, ctx, "pedido", pedido_id, "confirmar", {"status": "aguardando_pagamento"}, {"status": "confirmado"})
    return {"id": pedido_id, "status": "confirmado"}

def retirar_pedido(c, ctx, pedido_id):
    p = _pedido(c, ctx, pedido_id, ("confirmado", "pronto"))
    rows = c.execute("""SELECT r.id rid, r.quantidade q, i.produto_id pid FROM reserva_estoque r
        JOIN pedido_item i ON i.id=r.pedido_item_id WHERE i.pedido_id=? AND r.status='ativa'""", (pedido_id,)).fetchall()
    for r in rows:
        antes = c.execute("SELECT estoque_atual FROM produto WHERE id=?", (r["pid"],)).fetchone()[0]
        c.execute("UPDATE produto SET estoque_atual=estoque_atual-?,estoque_reservado=estoque_reservado-?,atualizado_em=? WHERE id=?",
                  (r["q"], r["q"], agora(), r["pid"]))
        registrar_movimento(c, ctx, r["pid"], pedido_id, "venda", "saida", r["q"], antes, antes - r["q"])
        c.execute("UPDATE reserva_estoque SET status='consumida',finalizada_em=? WHERE id=?", (agora(), r["rid"]))
    c.execute("UPDATE pedido SET status='retirado',retirado_em=?,atualizado_em=? WHERE id=?", (agora(), agora(), pedido_id))
    auditar(c, ctx, "pedido", pedido_id, "retirar", {"status": p["status"]}, {"status": "retirado"})
    return {"id": pedido_id, "status": "retirado"}

def expirar_pedidos(c, ctx):
    """Rodar a cada minuto: libera reservas de pedidos não pagos vencidos."""
    venc = c.execute("SELECT id,loja_id FROM pedido WHERE status='aguardando_pagamento' AND expira_em<?", (agora(),)).fetchall()
    for pid, loja in venc:
        for r in c.execute("""SELECT r.id rid,r.quantidade q,i.produto_id prod FROM reserva_estoque r
                JOIN pedido_item i ON i.id=r.pedido_item_id WHERE i.pedido_id=? AND r.status='ativa'""", (pid,)).fetchall():
            c.execute("UPDATE produto SET estoque_reservado=estoque_reservado-? WHERE id=?", (r["q"], r["prod"]))
            c.execute("UPDATE reserva_estoque SET status='expirada',finalizada_em=? WHERE id=?", (agora(), r["rid"]))
        c.execute("UPDATE pedido SET status='expirado',atualizado_em=? WHERE id=?", (agora(), pid))
        auditar(c, Ctx(loja), "pedido", pid, "expirar", {"status": "aguardando_pagamento"}, {"status": "expirado"})
    return {"expirados": len(venc)}
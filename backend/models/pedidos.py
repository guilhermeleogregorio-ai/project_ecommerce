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



from models.core import ErroNegocio, agora, auditar
from models.estoque import registrar_movimento

#produto

def criar_produto(c, ctx, d):
    cur = c.execute("""INSERT INTO produto(loja_id,categoria_id,nome,descricao,sku,preco_centavos,estoque_atual,
                       estoque_minimo,criado_por_execucao_id) VALUES(?,?,?,?,?,?,?,?,?)""",
        (ctx.loja_id, d.get("categoria_id"), d["nome"], d.get("descricao"), d.get("sku"), d["preco_centavos"],
         d.get("estoque_atual", 0), d.get("estoque_minimo", 0), ctx.exec_id))
    pid = cur.lastrowid
    if d.get("estoque_atual", 0) > 0:
        registrar_movimento(c, ctx, pid, None, "inventario", "entrada", d["estoque_atual"], 0, d["estoque_atual"])
    prod = dict(c.execute("SELECT * FROM produto WHERE id=?", (pid,)).fetchone())
    auditar(c, ctx, "produto", pid, "criar", None, prod)
    return prod
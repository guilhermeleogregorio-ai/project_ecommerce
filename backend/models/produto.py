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

def atualizar_produto(c, ctx, pid, campos):
    antes = c.execute("SELECT * FROM produto WHERE id=? AND loja_id=?", (pid, ctx.loja_id)).fetchone()
    if not antes: raise ErroNegocio("Produto não encontrado", 404)
    permitido = {"nome", "descricao", "preco_centavos", "estoque_minimo", "categoria_id", "ativo", "imagem_url"}
    campos = {k: v for k, v in campos.items() if k in permitido}
    if not campos: raise ErroNegocio("Nada para atualizar")
    sets = ", ".join(f"{k}=?" for k in campos)
    c.execute(f"UPDATE produto SET {sets}, atualizado_em=? WHERE id=?", (*campos.values(), agora(), pid))
    depois = dict(c.execute("SELECT * FROM produto WHERE id=?", (pid,)).fetchone())
    auditar(c, ctx, "produto", pid, "atualizar", {k: antes[k] for k in campos}, {k: depois[k] for k in campos})
    return depois

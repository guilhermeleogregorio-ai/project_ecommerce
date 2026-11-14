from models.core import ErroNegocio, agora, auditar
from models.estoque import registrar_movimento

def criar_produto(c, ctx, d):
    """
    Cadastra produto no SQLite respeitando o schema.sql.
    d deve conter: nome, sku, preco_centavos, estoque_atual, local_fisico, imagem_url
    """
    estoque_atual = d.get("estoque_atual", 0)
    cur = c.execute("""
        INSERT INTO produto(loja_id, nome, sku, preco_centavos, estoque_atual, estoque_reservado, local_fisico, imagem_url, ativo)
        VALUES(?, ?, ?, ?, ?, 0, ?, ?, 1)
    """, (
        ctx.loja_id,
        d["nome"],
        d.get("sku"),
        d["preco_centavos"],
        estoque_atual,
        d.get("local_fisico", "Balcão / Prateleira"),
        d.get("imagem_url")
    ))
    pid = cur.lastrowid
    if estoque_atual > 0:
        registrar_movimento(c, ctx, pid, None, "entrada", "entrada", estoque_atual, 0, estoque_atual)
    prod = dict(c.execute("SELECT * FROM produto WHERE id=?", (pid,)).fetchone())
    auditar(c, ctx, "produto", pid, "criar", None, prod)
    return prod

def atualizar_produto(c, ctx, pid, campos):
    antes = c.execute("SELECT * FROM produto WHERE id=? AND loja_id=?", (pid, ctx.loja_id)).fetchone()
    if not antes:
        raise ErroNegocio("Produto não encontrado", 404)
    permitido = {"nome", "sku", "preco_centavos", "local_fisico", "ativo", "imagem_url", "estoque_atual"}
    campos_filtrados = {k: v for k, v in campos.items() if k in permitido}
    if not campos_filtrados:
        raise ErroNegocio("Nada para atualizar")

    # Se alterar estoque manualmente, audita o movimento
    if "estoque_atual" in campos_filtrados and campos_filtrados["estoque_atual"] != antes["estoque_atual"]:
        diff = campos_filtrados["estoque_atual"] - antes["estoque_atual"]
        direcao = "entrada" if diff > 0 else "saida"
        registrar_movimento(c, ctx, pid, None, "ajuste", direcao, abs(diff), antes["estoque_atual"], campos_filtrados["estoque_atual"])

    sets = ", ".join(f"{k}=?" for k in campos_filtrados)
    c.execute(f"UPDATE produto SET {sets} WHERE id=?", (*campos_filtrados.values(), pid))
    depois = dict(c.execute("SELECT * FROM produto WHERE id=?", (pid,)).fetchone())
    auditar(c, ctx, "produto", pid, "atualizar", dict(antes), depois)
    return depois

import secrets
from models.core import Ctx, ErroNegocio, agora, auditar
from models.estoque import registrar_movimento

def criar_pedido(c, ctx, cliente_id, itens, tipo_entrega="retirada", cep_destino=None, frete_centavos=0):
    """
    Criação de pedido com reserva atômica de estoque:
    - Verifica se saldo livre (estoque_atual - estoque_reservado) >= quantidade desejada
    - Reserva atômica no produto
    - Define código de retirada seguro (ex: 6 caracteres alfa-numéricos em maiúsculo)
    - Expiração automática baseada no tempo configurado na tabela loja
    """
    loja = c.execute("SELECT reserva_minutos FROM loja WHERE id=?", (ctx.loja_id,)).fetchone()
    minutos_reserva = loja["reserva_minutos"] if loja else 120
    expira_em = agora(minutos_reserva)

    if not c.execute("SELECT 1 FROM cliente WHERE id=?", (cliente_id,)).fetchone():
        raise ErroNegocio("Cliente não encontrado", 404)

    if not itens:
        raise ErroNegocio("Pedido sem itens")

    # Calcula subtotal e valida estoque atomicamente
    subtotal = 0
    itens_processados = []
    for item in itens:
        pid = item["produto_id"]
        qtd = item["quantidade"]
        p = c.execute("SELECT * FROM produto WHERE id=? AND loja_id=? AND ativo=1", (pid, ctx.loja_id)).fetchone()
        if not p:
            raise ErroNegocio(f"Produto {pid} indisponível", 404)
        
        saldo_livre = p["estoque_atual"] - p["estoque_reservado"]
        if saldo_livre < qtd:
            raise ErroNegocio(f"Sem estoque para '{p['nome']}'. Disponível para reserva: {saldo_livre}", 409)
        
        preco_unit = p["preco_centavos"]
        subtotal += preco_unit * qtd
        itens_processados.append({
            "produto_id": pid,
            "quantidade": qtd,
            "preco_unit_centavos": preco_unit,
            "nome_snapshot": p["nome"]
        })

    total = subtotal + frete_centavos
    codigo_retirada = secrets.token_hex(3).upper() if tipo_entrega == "retirada" else None

    # Insere o pedido
    cursor = c.execute("""
        INSERT INTO pedido(
            loja_id, cliente_id, tipo_entrega, cep_destino, status,
            subtotal_centavos, frete_centavos, total_centavos,
            codigo_retirada, expira_em
        ) VALUES (?, ?, ?, ?, 'aguardando_pagamento', ?, ?, ?, ?, ?)
    """, (
        ctx.loja_id, cliente_id, tipo_entrega, cep_destino,
        subtotal, frete_centavos, total, codigo_retirada, expira_em
    ))
    pedido_id = cursor.lastrowid

    # Reserva estoque e grava pedido_item
    for it in itens_processados:
        c.execute("""
            UPDATE produto 
            SET estoque_reservado = estoque_reservado + ? 
            WHERE id = ? AND loja_id = ?
        """, (it["quantidade"], it["produto_id"], ctx.loja_id))

        c.execute("""
            INSERT INTO pedido_item(loja_id, pedido_id, produto_id, quantidade, preco_unit_centavos, nome_snapshot)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (ctx.loja_id, pedido_id, it["produto_id"], it["quantidade"], it["preco_unit_centavos"], it["nome_snapshot"]))

    ped = dict(c.execute("SELECT * FROM pedido WHERE id=?", (pedido_id,)).fetchone())
    auditar(c, ctx, "pedido", pedido_id, "criar", None, ped)
    return ped

def confirmar_pagamento(c, ctx, pedido_id, metodo="pix"):
    ped = c.execute("SELECT * FROM pedido WHERE id=? AND loja_id=?", (pedido_id, ctx.loja_id)).fetchone()
    if not ped:
        raise ErroNegocio("Pedido não encontrado", 404)
    if ped["status"] != "aguardando_pagamento":
        raise ErroNegocio(f"Pedido não pode ser pago com status atual: {ped['status']}", 409)

    c.execute("UPDATE pedido SET status='pago' WHERE id=?", (pedido_id,))
    
    # Registra o pagamento na tabela pagamento
    c.execute("""
        INSERT INTO pagamento(loja_id, pedido_id, metodo, status, valor_centavos, pago_em)
        VALUES (?, ?, ?, 'aprovado', ?, ?)
    """, (ctx.loja_id, pedido_id, metodo, ped["total_centavos"], agora()))

    auditar(c, ctx, "pedido", pedido_id, "pagamento_aprovado", {"status": "aguardando_pagamento"}, {"status": "pago"})
    return {"id": pedido_id, "status": "pago"}

def separar_pedido(c, ctx, pedido_id):
    """
    O atendente na rotina da loja física confere o item e coloca na caixa de retirada.
    """
    ped = c.execute("SELECT * FROM pedido WHERE id=? AND loja_id=?", (pedido_id, ctx.loja_id)).fetchone()
    if not ped:
        raise ErroNegocio("Pedido não encontrado", 404)
    if ped["status"] != "pago":
        raise ErroNegocio(f"Pedido precisa estar 'pago' para separação. Status atual: {ped['status']}", 409)

    c.execute("UPDATE pedido SET status='separado' WHERE id=?", (pedido_id,))
    auditar(c, ctx, "pedido", pedido_id, "separar", {"status": "pago"}, {"status": "separado"})
    return {"id": pedido_id, "status": "separado"}

def concluir_retirada(c, ctx, codigo_retirada):
    """
    Cliente chega no balcão da loja física e informa o código de retirada.
    O sistema baixa o estoque definitivamente (estoque_atual e estoque_reservado)
    e grava a saída no livro movimento_estoque.
    """
    ped = c.execute("""
        SELECT * FROM pedido 
        WHERE codigo_retirada = ? AND loja_id = ?
    """, (codigo_retirada.strip().upper(), ctx.loja_id)).fetchone()

    if not ped:
        raise ErroNegocio("Código de retirada inválido ou pedido não encontrado", 404)
    if ped["status"] not in ("pago", "separado"):
        raise ErroNegocio(f"Pedido com status '{ped['status']}' não está pronto para retirada", 409)

    pedido_id = ped["id"]
    itens = c.execute("SELECT * FROM pedido_item WHERE pedido_id=?", (pedido_id,)).fetchall()

    for it in itens:
        pid = it["produto_id"]
        qtd = it["quantidade"]
        p = c.execute("SELECT estoque_atual, estoque_reservado FROM produto WHERE id=?", (pid,)).fetchone()
        antes = p["estoque_atual"]
        depois = antes - qtd

        c.execute("""
            UPDATE produto 
            SET estoque_atual = estoque_atual - ?,
                estoque_reservado = estoque_reservado - ?
            WHERE id = ?
        """, (qtd, qtd, pid))

        registrar_movimento(c, ctx, pid, pedido_id, "venda_pedido", "saida", qtd, antes, depois, obs=f"Retirada balcão #{codigo_retirada}")

    c.execute("UPDATE pedido SET status='concluido' WHERE id=?", (pedido_id,))
    auditar(c, ctx, "pedido", pedido_id, "retirar_balcao", {"status": ped["status"]}, {"status": "concluido"})
    return {"id": pedido_id, "codigo_retirada": codigo_retirada, "status": "concluido"}

def registrar_venda_balcao(c, ctx, itens, usuario_id=None):
    """
    Venda direta presencial no balcão da loja física.
    Baixa o estoque_atual imediatamente sem passar por reserva online.
    Evita que o lojista venda no balcão um item que já estava reservado online!
    """
    for it in itens:
        pid = it["produto_id"]
        qtd = it["quantidade"]
        p = c.execute("SELECT * FROM produto WHERE id=? AND loja_id=?", (pid, ctx.loja_id)).fetchone()
        if not p:
            raise ErroNegocio(f"Produto {pid} não encontrado", 404)
        
        saldo_livre = p["estoque_atual"] - p["estoque_reservado"]
        if saldo_livre < qtd:
            raise ErroNegocio(
                f"Estoque livre insuficiente no balcão para '{p['nome']}'. "
                f"Total físico: {p['estoque_atual']} (Reservado online: {p['estoque_reservado']})", 409
            )

        antes = p["estoque_atual"]
        depois = antes - qtd
        c.execute("UPDATE produto SET estoque_atual = estoque_atual - ? WHERE id = ?", (qtd, pid))
        registrar_movimento(c, ctx, pid, None, "venda_balcao", "saida", qtd, antes, depois, obs="Venda presencial no balcão")

    return {"status": "sucesso", "mensagem": "Venda de balcão registrada com sucesso"}

def expirar_pedidos(c, ctx):
    """
    Rotina periódica: se o pedido em 'aguardando_pagamento' ultrapassar o prazo de expiração,
    a reserva de estoque é devolvida ao saldo livre automaticamente.
    """
    vencidos = c.execute("""
        SELECT id FROM pedido 
        WHERE status = 'aguardando_pagamento' AND expira_em < ? AND loja_id = ?
    """, (agora(), ctx.loja_id)).fetchall()

    for row in vencidos:
        pid = row["id"]
        itens = c.execute("SELECT * FROM pedido_item WHERE pedido_id = ?", (pid,)).fetchall()
        for it in itens:
            c.execute("""
                UPDATE produto 
                SET estoque_reservado = estoque_reservado - ? 
                WHERE id = ?
            """, (it["quantidade"], it["produto_id"]))

        c.execute("UPDATE pedido SET status = 'expirado' WHERE id = ?", (pid,))
        auditar(c, ctx, "pedido", pid, "expirado_automatico", {"status": "aguardando_pagamento"}, {"status": "expirado"})

    return len(vencidos)

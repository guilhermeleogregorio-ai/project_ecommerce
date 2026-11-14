def registrar_movimento(c, ctx, pid, pedido_id, tipo, direcao, qtd, antes, depois):
    c.execute("""INSERT INTO movimento_estoque(loja_id,produto_id,pedido_id,agente_execucao_id,tipo,direcao,quantidade,
                 estoque_antes,estoque_depois,origem) VALUES(?,?,?,?,?,?,?,?,?,?)""",
              (ctx.loja_id, pid, pedido_id, ctx.exec_id, tipo, direcao, qtd, antes, depois,
               "agente" if ctx.exec_id else "sistema"))

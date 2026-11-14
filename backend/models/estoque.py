from models.core import Ctx, auditar

def registrar_movimento(c, ctx, pid, pedido_id, tipo, direcao, qtd, antes, depois, obs=None):
    """
    Registra toda e qualquer alteração de estoque no livro razão imutável (movimento_estoque).
    Garante rastreabilidade entre venda de balcão e online.
    """
    # Consulta estoque reservado atual para manter conformidade com as constraints do schema
    p = c.execute("SELECT estoque_reservado FROM produto WHERE id=?", (pid,)).fetchone()
    res_antes = p["estoque_reservado"] if p else 0
    res_depois = res_antes
    
    origem = "balcao" if tipo == "venda_balcao" else ("assistente" if ctx.exec_id else "loja_online")
    
    c.execute("""
        INSERT INTO movimento_estoque(
            loja_id, produto_id, pedido_id, agente_execucao_id, tipo,
            quantidade, estoque_antes, estoque_depois, estoque_reservado_antes,
            estoque_reservado_depois, origem, observacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ctx.loja_id, pid, pedido_id, ctx.exec_id, tipo,
        qtd, antes, depois, res_antes, res_depois, origem, obs
    ))

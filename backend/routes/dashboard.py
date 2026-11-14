from fastapi import APIRouter
from database.connection import tx

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard/metrics")
def obter_metricas_varejo(loja_id: int = 1):
    with tx() as conn:
        # 1. Totalizadores de pedidos
        pedidos_rows = conn.execute("""
            SELECT 
                COUNT(*) as total_pedidos,
                COALESCE(SUM(total_centavos), 0) as total_vendas_centavos
            FROM pedido
            WHERE loja_id = ? AND status IN ('pago', 'separado', 'concluido')
        """, (loja_id,)).fetchone()

        total_vendas = pedidos_rows["total_vendas_centavos"] / 100.0
        total_pedidos = pedidos_rows["total_pedidos"]

        # Pedidos aguardando retirada ou separação
        pendentes_retirada = conn.execute("""
            SELECT COUNT(*) FROM pedido 
            WHERE loja_id = ? AND status IN ('pago', 'separado')
        """, (loja_id,)).fetchone()[0]

        # 2. Alertas de estoque baixo (<= 15 unidades no balcão)
        low_stock_rows = conn.execute("""
            SELECT id, nome as name, sku, estoque_atual as stock, 
                   estoque_reservado, (estoque_atual - estoque_reservado) as saldo_livre,
                   local_fisico
            FROM produto
            WHERE loja_id = ? AND (estoque_atual - estoque_reservado) <= 15 AND ativo = 1
            ORDER BY saldo_livre ASC
        """, (loja_id,)).fetchall()

        # 3. Execuções recentes dos agentes de IA
        agentes_rows = conn.execute("""
            SELECT id, agente, solicitacao, status, iniciado_em
            FROM agente_execucao
            WHERE loja_id = ?
            ORDER BY id DESC
            LIMIT 5
        """, (loja_id,)).fetchall()

        # 4. Movimentações recentes de estoque (audit trail)
        mov_rows = conn.execute("""
            SELECT m.*, p.nome as produto_nome
            FROM movimento_estoque m
            JOIN produto p ON p.id = m.produto_id
            WHERE m.loja_id = ?
            ORDER BY m.id DESC
            LIMIT 6
        """, (loja_id,)).fetchall()

        return {
            "kpis": {
                "total_sales": round(total_vendas, 2),
                "orders_count": total_pedidos,
                "pending_pickup": pendentes_retirada,
                "low_stock_count": len(low_stock_rows),
                "ai_executions_count": conn.execute("SELECT COUNT(*) FROM agente_execucao WHERE loja_id = ?", (loja_id,)).fetchone()[0]
            },
            "low_stock_alerts": [dict(r) for r in low_stock_rows],
            "recent_ai_executions": [dict(r) for r in agentes_rows],
            "recent_stock_movements": [dict(r) for r in mov_rows]
        }

from agents.base import AgentInstance
from models.pedidos import expirar_pedidos

class InventoryAgentInstance(AgentInstance):
    """
    Instância especializada em Balcão Físico, Auditoria de Estoque e Expiração de Reservas.
    Mantém a integridade física vs digital para evitar rupturas de estoque.
    """
    def __init__(self, instance_id: str, name: str = "Inventory / Balcão Worker"):
        super().__init__(instance_id, agent_type="estoque", name=name)

    def execute(self, conn, ctx, task: str, payload: dict) -> dict:
        if "expirar" in task.lower() or "limpar" in task.lower():
            expirados = expirar_pedidos(conn, ctx)
            return {
                "instance_id": self.instance_id,
                "tipo": "expiracao_executada",
                "pedidos_expirados": expirados,
                "resposta": f"Auditoria concluída. {expirados} reservas expiradas foram devolvidas ao saldo livre."
            }

        # Status geral de estoque
        total_produtos = conn.execute("SELECT COUNT(*) FROM produto WHERE loja_id=? AND ativo=1", (ctx.loja_id,)).fetchone()[0]
        reservados = conn.execute("SELECT SUM(estoque_reservado) FROM produto WHERE loja_id=?", (ctx.loja_id,)).fetchone()[0] or 0
        baixo_estoque = conn.execute("SELECT COUNT(*) FROM produto WHERE loja_id=? AND (estoque_atual - estoque_reservado) <= 5", (ctx.loja_id,)).fetchone()[0]

        return {
            "instance_id": self.instance_id,
            "tipo": "auditoria_balcao",
            "total_produtos": total_produtos,
            "itens_reservados_online": reservados,
            "alertas_baixo_estoque": baixo_estoque,
            "resposta": f"Estoque Balcão: {total_produtos} produtos cadastrados, {reservados} unidades reservadas para retirada online, {baixo_estoque} itens em nível crítico."
        }

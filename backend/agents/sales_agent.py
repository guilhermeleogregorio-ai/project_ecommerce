import re
from agents.base import AgentInstance
from models.pedidos import criar_pedido

class SalesAgentInstance(AgentInstance):
    """
    Instância especializada em Atendimento e Vendas por Mensagem / WhatsApp.
    Interpreta mensagens não estruturadas de clientes, reserva produtos atomicamente
    e emite o código de retirada na loja física.
    """
    def __init__(self, instance_id: str, name: str = "Sales Worker"):
        super().__init__(instance_id, agent_type="vendas", name=name)

    def execute(self, conn, ctx, task: str, payload: dict) -> dict:
        produtos = conn.execute("SELECT * FROM produto WHERE loja_id=? AND ativo=1", (ctx.loja_id,)).fetchall()
        itens_identificados = []

        for p in produtos:
            palavras_prod = p["nome"].lower().split()
            matches = [w for w in palavras_prod if len(w) > 3 and w in task.lower()]
            if len(matches) >= 1 or p["nome"].lower() in task.lower():
                match_q = re.search(r'(\d+)\s*(?:x|de)?\s*' + re.escape(matches[0] if matches else p['nome']), task.lower())
                qtd = int(match_q.group(1)) if match_q else 1
                itens_identificados.append({
                    "produto_id": p["id"],
                    "nome": p["nome"],
                    "quantidade": qtd,
                    "preco_unit": p["preco_centavos"] / 100.0
                })

        if not itens_identificados:
            return {
                "instance_id": self.instance_id,
                "sucesso": False,
                "resposta": "Não consegui identificar com certeza quais itens foram solicitados na mensagem. Por favor, verifique o catálogo."
            }

        # Busca ou cria cliente de atendimento digital
        cli = conn.execute("SELECT id FROM cliente WHERE email='cliente.zap@loja.com'").fetchone()
        if cli:
            cliente_id = cli["id"]
        else:
            cur = conn.execute("""
                INSERT INTO cliente (nome, email, telefone, senha_hash, endereco)
                VALUES ('Cliente WhatsApp', 'cliente.zap@loja.com', '(14) 99888-0000', 'hash_simulado', 'Balcão')
            """)
            cliente_id = cur.lastrowid

        # Reserva atômica
        itens_payload = [{"produto_id": it["produto_id"], "quantidade": it["quantidade"]} for it in itens_identificados]
        pedido = criar_pedido(conn, ctx, cliente_id, itens_payload, tipo_entrega="retirada")

        resposta = (
            f"✅ Pedido pré-reservado com sucesso via mensagem!\n"
            f"• Pedido #{pedido['id']} | Total: R$ {pedido['total_centavos']/100.0:.2f}\n"
            f"• Código para retirada no balcão: **{pedido['codigo_retirada']}**\n"
            f"• Itens separados temporariamente. Reserva expira em: {pedido['expira_em']}.\n"
            f"O cliente pode retirar e pagar diretamente no balcão da loja física."
        )

        return {
            "instance_id": self.instance_id,
            "sucesso": True,
            "pedido": pedido,
            "resposta": resposta,
            "itens": itens_identificados
        }

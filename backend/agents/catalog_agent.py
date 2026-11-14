import re
from agents.base import AgentInstance
from models.produto import criar_produto

class CatalogAgentInstance(AgentInstance):
    """
    Instância especializada em Catálogo, Localização de Produtos e Estoque Físico.
    Suporta:
    1. Consulta em linguagem natural (ex: "Tem Coca-Cola 2L?", "Onde fica o sabonete?")
    2. Proposta guiada de cadastro com confirmação humana.
    """
    def __init__(self, instance_id: str, name: str = "Catalog Worker"):
        super().__init__(instance_id, agent_type="catalogo", name=name)

    def execute(self, conn, ctx, task: str, payload: dict) -> dict:
        # Se for confirmação direta para persistência
        if payload.get("confirmado"):
            dados = payload.get("produto", {})
            prod = criar_produto(conn, ctx, dados)
            return {
                "instance_id": self.instance_id,
                "tipo": "produto_cadastrado",
                "resposta": f"Produto '{prod['nome']}' cadastrado e integrado com sucesso na loja física e digital!",
                "produto": prod
            }

        # Se for pedido de cadastro
        if any(k in task.lower() for k in ["cadastr", "adicionar", "novo produto", "incluir"]):
            proposta = self._gerar_proposta_cadastro(task)
            return {
                "instance_id": self.instance_id,
                "tipo": "proposta_cadastro",
                "resposta": "Analisei sua solicitação e preparei a proposta de cadastro. Por favor, confirme os dados:",
                "proposta": proposta
            }

        # Consulta de estoque
        return self._consultar_estoque(conn, ctx, task)

    def _consultar_estoque(self, conn, ctx, texto: str) -> dict:
        palavras = [w for w in re.split(r'\W+', texto.lower()) if len(w) > 2]
        termos_comuns = {"tem", "qual", "quais", "quanto", "quantos", "quantas", "temos", "estoque", "disponivel", "onde", "fica"}
        palavras_chave = [p for p in palavras if p not in termos_comuns]

        if not palavras_chave:
            produtos = conn.execute("SELECT * FROM produto WHERE loja_id=? AND ativo=1 LIMIT 5", (ctx.loja_id,)).fetchall()
        else:
            like_clauses = " OR ".join(["nome LIKE ?"] * len(palavras_chave))
            params = [f"%{p}%" for p in palavras_chave]
            produtos = conn.execute(f"""
                SELECT * FROM produto 
                WHERE loja_id=? AND ativo=1 AND ({like_clauses})
            """, [ctx.loja_id] + params).fetchall()

        if not produtos:
            return {
                "instance_id": self.instance_id,
                "encontrado": False,
                "resposta": f"Não encontrei nenhum item correspondente a '{texto}' no estoque da loja.",
                "itens": []
            }

        itens = []
        respostas = []
        for p in produtos:
            saldo_livre = p["estoque_atual"] - p["estoque_reservado"]
            preco_reais = p["preco_centavos"] / 100.0
            itens.append({
                "id": p["id"],
                "nome": p["nome"],
                "preco": preco_reais,
                "estoque_total": p["estoque_atual"],
                "estoque_reservado": p["estoque_reservado"],
                "saldo_livre": saldo_livre,
                "local_fisico": p["local_fisico"]
            })
            respostas.append(
                f"• **{p['nome']}**: {saldo_livre} unidades livres para venda "
                f"(Total físico: {p['estoque_atual']}, Reservado online: {p['estoque_reservado']}). "
                f"Preço: R$ {preco_reais:.2f}. Local: {p['local_fisico']}."
            )

        return {
            "instance_id": self.instance_id,
            "encontrado": True,
            "resposta": "Aqui está a conferência de estoque em tempo real:\n" + "\n".join(respostas),
            "itens": itens
        }

    def _gerar_proposta_cadastro(self, texto: str) -> dict:
        preco_centavos = 1000
        match_preco = re.search(r'(?:r\$|\$)?\s*(\d+(?:[,\.]\d{1,2})?)', texto.lower())
        if match_preco:
            val_str = match_preco.group(1).replace(',', '.')
            try:
                preco_centavos = int(float(val_str) * 100)
            except ValueError:
                pass

        match_qtd = re.search(r'(\d+)\s*(?:unidades?|itens?|un|peças?)', texto.lower())
        estoque = int(match_qtd.group(1)) if match_qtd else 10

        match_local = re.search(r'(?:na|no|em|local:?)\s*(g[oô]ndola\s*[a-z0-9]+|prateleira\s*[a-z0-9]+|gaveta\s*[a-z0-9]+|balc[aã]o|corredor\s*\d+)', texto.lower())
        local_fisico = match_local.group(1).title() if match_local else "Gôndola A1 - Balcão"

        nome_limpo = texto
        for p in ["cadastrar", "adicionar", "novo produto", "por", "com", "na", "no"]:
            nome_limpo = re.sub(rf'\b{p}\b', '', nome_limpo, flags=re.IGNORECASE)
        nome_limpo = re.sub(r'(\d+[,\.]\d+|\d+\s*unidades?|\d+)', '', nome_limpo).strip()
        if not nome_limpo or len(nome_limpo) < 3:
            nome_limpo = "Produto Novo"

        return {
            "nome": nome_limpo.capitalize(),
            "preco_centavos": preco_centavos,
            "preco_formatado": f"R$ {preco_centavos / 100.0:.2f}",
            "estoque_atual": estoque,
            "local_fisico": local_fisico,
            "sku": f"PROD-{re.sub(r'[^A-Z0-9]', '', nome_limpo.upper())[:6]}-{estoque}",
            "necessita_confirmacao": True
        }

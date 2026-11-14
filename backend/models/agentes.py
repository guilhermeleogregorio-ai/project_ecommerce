import re
from models.core import Ctx, ErroNegocio, auditar, executar
from models.produto import criar_produto
from models.pedidos import criar_pedido

def processar_consulta_estoque(conn, ctx, texto):
    """
    Agente de Catálogo - Consulta em Linguagem Natural:
    Exemplo: "Tem caderno 10 matérias?", "Quantas canetas azuis temos?"
    Retorna a disponibilidade, estoque físico, reservado e localização no balcão.
    """
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
            "encontrado": False,
            "resposta": f"Não encontrei nenhum produto correspondente a '{texto}' no estoque da loja.",
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
        "encontrado": True,
        "resposta": "Aqui está a conferência de estoque em tempo real:\n" + "\n".join(respostas),
        "itens": itens
    }

def processar_proposta_cadastro(texto):
    """
    Agente de Catálogo - Cadastro Guiado de Produto:
    O lojista dita ou digita: "Cadastrar Caderno Espiral 10 Matérias por 24,90 com 30 unidades na Prateleira A"
    A IA extrai os atributos e propõe para confirmação do lojista (Autonomia com Confirmação Humana).
    """
    # Extrai preço
    preco_centavos = 1000  # Default R$ 10,00
    match_preco = re.search(r'(?:r\$|\$)?\s*(\d+(?:[,\.]\d{1,2})?)', texto.lower())
    if match_preco:
        val_str = match_preco.group(1).replace(',', '.')
        try:
            preco_centavos = int(float(val_str) * 100)
        except ValueError:
            pass

    # Extrai quantidade/estoque
    match_qtd = re.search(r'(\d+)\s*(?:unidades?|itens?|un|peças?)', texto.lower())
    estoque = int(match_qtd.group(1)) if match_qtd else 10

    # Extrai local físico
    match_local = re.search(r'(?:na|no|em|local:?)\s*(prateleira\s*[a-z0-9]+|gaveta\s*[a-z0-9]+|balc[aã]o|corredor\s*\d+)', texto.lower())
    local_fisico = match_local.group(1).title() if match_local else "Prateleira A1 - Balcão"

    # Nome limpo
    nome_limpo = texto
    for p in ["cadastrar", "adicionar", "novo produto", "por", "com", "na", "no"]:
        nome_limpo = re.sub(rf'\b{p}\b', '', nome_limpo, flags=re.IGNORECASE)
    nome_limpo = re.sub(r'(\d+[,\.]\d+|\d+\s*unidades?|\d+)', '', nome_limpo).strip()
    if not nome_limpo or len(nome_limpo) < 3:
        nome_limpo = "Produto Novo"

    proposta = {
        "nome": nome_limpo.capitalize(),
        "preco_centavos": preco_centavos,
        "preco_formatado": f"R$ {preco_centavos / 100.0:.2f}",
        "estoque_atual": estoque,
        "local_fisico": local_fisico,
        "sku": f"PROD-{re.sub(r'[^A-Z0-9]', '', nome_limpo.upper())[:6]}-{estoque}",
        "necessita_confirmacao": True
    }
    return proposta

def processar_pedido_mensagem(conn, ctx, texto):
    """
    Agente de Vendas - Conversão de Mensagem (WhatsApp / Chat) em Pedido com Retirada:
    Baseado no dado TIC Empresas: 81% dos varejistas recebem pedidos por mensagem.
    Este agente interpreta a mensagem, reserva os itens e gera o código de retirada.
    """
    # Procura produtos citados na mensagem
    produtos = conn.execute("SELECT * FROM produto WHERE loja_id=? AND ativo=1", (ctx.loja_id,)).fetchall()
    itens_identificados = []

    for p in produtos:
        palavras_prod = p["nome"].lower().split()
        # Se 2 ou mais palavras coincidirem
        matches = [w for w in palavras_prod if len(w) > 3 and w in texto.lower()]
        if len(matches) >= 1 or p["nome"].lower() in texto.lower():
            # Tenta achar quantidade próxima
            match_q = re.search(r'(\d+)\s*(?:x|de)?\s*' + re.escape(matches[0] if matches else p['nome']), texto.lower())
            qtd = int(match_q.group(1)) if match_q else 1
            itens_identificados.append({
                "produto_id": p["id"],
                "nome": p["nome"],
                "quantidade": qtd,
                "preco_unit": p["preco_centavos"] / 100.0
            })

    if not itens_identificados:
        return {
            "sucesso": False,
            "resposta": "Não consegui identificar com certeza quais itens o cliente pediu. Por favor, verifique o catálogo."
        }

    # Busca ou cria cliente padrão de mensagem
    cli = conn.execute("SELECT id FROM cliente WHERE email='cliente.zap@loja.com'").fetchone()
    if cli:
        cliente_id = cli["id"]
    else:
        cur = conn.execute("""
            INSERT INTO cliente (nome, email, telefone, senha_hash, endereco)
            VALUES ('Cliente WhatsApp', 'cliente.zap@loja.com', '(14) 99888-0000', 'hash_simulado', 'Balcão')
        """)
        cliente_id = cur.lastrowid

    # Cria pedido com reserva atômica
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
        "sucesso": True,
        "pedido": pedido,
        "resposta": resposta,
        "itens": itens_identificados
    }

def orquestrar_agente(loja_id: int, tipo_agente: str, solicitacao: str, confirmacao_payload: dict = None):
    """
    Orquestrador Central dos Agentes de IA (Catalogo, Vendas, Configuracao)
    Implementa:
    1. Execução rastreada e auditada no banco (agente_execucao).
    2. Autonomia com supervisão humana (o agente propõe, o lojista confirma).
    """
    def _run(conn, ctx):
        if tipo_agente == "catalogo":
            # 1. Confirmação do lojista para criar produto
            if confirmacao_payload and confirmacao_payload.get("confirmado"):
                dados = confirmacao_payload["produto"]
                prod = criar_produto(conn, ctx, dados)
                return {
                    "tipo": "produto_cadastrado",
                    "resposta": f"Produto '{prod['nome']}' cadastrado e integrado com sucesso na loja física e online!",
                    "produto": prod
                }

            # 2. Se for solicitação de cadastro, gera proposta guiada
            if any(k in solicitacao.lower() for k in ["cadastr", "adicionar", "novo produto", "incluir"]):
                proposta = processar_proposta_cadastro(solicitacao)
                return {
                    "tipo": "proposta_cadastro",
                    "resposta": "Analisei sua solicitação e preparei a proposta de cadastro. Por favor, confirme os dados:",
                    "proposta": proposta
                }

            # 3. Consulta de estoque em linguagem natural (rotina do balcão)
            return processar_consulta_estoque(conn, ctx, solicitacao)

        elif tipo_agente == "vendas":
            return processar_pedido_mensagem(conn, ctx, solicitacao)

        else:
            return {"tipo": "geral", "resposta": "Agente disponível para catálogo, vendas ou conferência de balcão."}

    return executar(loja_id, tipo_agente, None, solicitacao, _run)

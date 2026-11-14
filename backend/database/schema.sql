
CREATE TABLE IF NOT EXISTS loja (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT,
    endereco_retirada TEXT,
    cep_origem TEXT,
    aceita_entrega INTEGER NOT NULL DEFAULT 0
        CHECK (aceita_entrega IN (0, 1)),
    reserva_minutos INTEGER NOT NULL DEFAULT 120
        CHECK (reserva_minutos > 0)
);

CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    senha_hash TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'atendente'
        CHECK (papel IN ('dono', 'atendente')),
    ativo INTEGER NOT NULL DEFAULT 1
        CHECK (ativo IN (0, 1)),

    UNIQUE (loja_id, email),
    UNIQUE (id, loja_id),

    FOREIGN KEY (loja_id) REFERENCES loja(id)
);

CREATE TABLE IF NOT EXISTS cliente (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    cep TEXT CHECK (cep IS NULL OR length(cep) = 8),
    endereco TEXT,
    consentimento_em TEXT,
    criado_em TEXT NOT NULL DEFAULT
        (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS produto (
    id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    sku TEXT,
    preco_centavos INTEGER NOT NULL
        CHECK (preco_centavos >= 0),
    estoque_atual INTEGER NOT NULL DEFAULT 0
        CHECK (estoque_atual >= 0),
    estoque_reservado INTEGER NOT NULL DEFAULT 0
        CHECK (estoque_reservado >= 0),
    local_fisico TEXT,
    peso_gramas INTEGER
        CHECK (peso_gramas IS NULL OR peso_gramas > 0),
    imagem_url TEXT,
    ativo INTEGER NOT NULL DEFAULT 1
        CHECK (ativo IN (0, 1)),

    CHECK (estoque_reservado <= estoque_atual),
    UNIQUE (id, loja_id),

    FOREIGN KEY (loja_id) REFERENCES loja(id)
);

CREATE TABLE IF NOT EXISTS pedido (
    id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    tipo_entrega TEXT NOT NULL
        CHECK (tipo_entrega IN ('retirada', 'entrega')),
    cep_destino TEXT,
    status TEXT NOT NULL DEFAULT 'aguardando_pagamento'
        CHECK (status IN (
            'aguardando_pagamento',
            'pago',
            'separado',
            'concluido',
            'cancelado',
            'expirado'
        )),
    subtotal_centavos INTEGER NOT NULL
        CHECK (subtotal_centavos >= 0),
    frete_centavos INTEGER NOT NULL DEFAULT 0
        CHECK (frete_centavos >= 0),
    total_centavos INTEGER NOT NULL
        CHECK (total_centavos >= 0),
    codigo_retirada TEXT,
    criado_em TEXT NOT NULL DEFAULT
        (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    expira_em TEXT NOT NULL,

    CHECK (total_centavos = subtotal_centavos + frete_centavos),
    CHECK (tipo_entrega = 'retirada' OR cep_destino IS NOT NULL),

    UNIQUE (id, loja_id),

    FOREIGN KEY (loja_id) REFERENCES loja(id),
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

CREATE TABLE IF NOT EXISTS pedido_item (
    id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    pedido_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unit_centavos INTEGER NOT NULL
        CHECK (preco_unit_centavos >= 0),
    nome_snapshot TEXT NOT NULL,

    UNIQUE (pedido_id, produto_id),

    FOREIGN KEY (pedido_id, loja_id)
        REFERENCES pedido(id, loja_id),

    FOREIGN KEY (produto_id, loja_id)
        REFERENCES produto(id, loja_id)
);

CREATE TABLE IF NOT EXISTS agente_execucao (
    id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    usuario_id INTEGER,
    execucao_pai_id INTEGER,
    agente TEXT NOT NULL
        CHECK (agente IN ('catalogo', 'vendas', 'configuracao')),
    versao_agente TEXT,
    modelo_ia TEXT,
    correlation_id TEXT,
    solicitacao TEXT NOT NULL,
    resultado TEXT,
    status TEXT NOT NULL
        CHECK (status IN ('iniciado', 'concluido', 'erro')),
    iniciado_em TEXT NOT NULL DEFAULT
        (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    finalizado_em TEXT,

    UNIQUE (id, loja_id),

    FOREIGN KEY (loja_id) REFERENCES loja(id),

    FOREIGN KEY (usuario_id, loja_id)
        REFERENCES usuario(id, loja_id),

    FOREIGN KEY (execucao_pai_id, loja_id)
        REFERENCES agente_execucao(id, loja_id)
);

CREATE TABLE IF NOT EXISTS pagamento (
    id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    pedido_id INTEGER NOT NULL,
    metodo TEXT NOT NULL
        CHECK (metodo IN ('pix', 'cartao', 'dinheiro')),
    status TEXT NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'aprovado', 'recusado', 'estornado')),
    valor_centavos INTEGER NOT NULL
        CHECK (valor_centavos >= 0),
    referencia_externa TEXT,
    criado_em TEXT NOT NULL DEFAULT
        (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    atualizado_em TEXT,
    pago_em TEXT,

    UNIQUE (loja_id, pedido_id),

    FOREIGN KEY (loja_id) REFERENCES loja(id),

    FOREIGN KEY (pedido_id, loja_id)
        REFERENCES pedido(id, loja_id)
);

CREATE TABLE IF NOT EXISTS movimento_estoque (
    id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    pedido_id INTEGER,
    usuario_id INTEGER,
    agente_execucao_id INTEGER,
    tipo TEXT NOT NULL
        CHECK (tipo IN (
            'entrada',
            'venda_balcao',
            'reserva_pedido',
            'liberacao_reserva',
            'venda_pedido',
            'ajuste'
        )),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    estoque_antes INTEGER NOT NULL CHECK (estoque_antes >= 0),
    estoque_depois INTEGER NOT NULL CHECK (estoque_depois >= 0),
    estoque_reservado_antes INTEGER NOT NULL
        CHECK (estoque_reservado_antes >= 0),
    estoque_reservado_depois INTEGER NOT NULL
        CHECK (estoque_reservado_depois >= 0),
    origem TEXT NOT NULL
        CHECK (origem IN ('balcao', 'loja_online', 'assistente', 'sistema')),
    observacao TEXT,
    criado_em TEXT NOT NULL DEFAULT
        (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    CHECK (estoque_reservado_antes <= estoque_antes),
    CHECK (estoque_reservado_depois <= estoque_depois),

    FOREIGN KEY (loja_id) REFERENCES loja(id),

    FOREIGN KEY (produto_id, loja_id)
        REFERENCES produto(id, loja_id),

    FOREIGN KEY (pedido_id, loja_id)
        REFERENCES pedido(id, loja_id),

    FOREIGN KEY (usuario_id, loja_id)
        REFERENCES usuario(id, loja_id),

    FOREIGN KEY (agente_execucao_id, loja_id)
        REFERENCES agente_execucao(id, loja_id)
);

CREATE TABLE IF NOT EXISTS auditoria_evento (
    id INTEGER PRIMARY KEY,
    loja_id INTEGER NOT NULL,
    agente_execucao_id INTEGER,
    usuario_id INTEGER,
    correlation_id TEXT,
    entidade TEXT NOT NULL,
    entidade_id INTEGER NOT NULL,
    acao TEXT NOT NULL,
    dados_anteriores TEXT,
    dados_posteriores TEXT,
    detalhes TEXT,
    origem TEXT NOT NULL
        CHECK (origem IN ('usuario', 'agente', 'sistema')),
    criado_em TEXT NOT NULL DEFAULT
        (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    FOREIGN KEY (loja_id) REFERENCES loja(id),

    FOREIGN KEY (agente_execucao_id, loja_id)
        REFERENCES agente_execucao(id, loja_id),

    FOREIGN KEY (usuario_id, loja_id)
        REFERENCES usuario(id, loja_id)
);

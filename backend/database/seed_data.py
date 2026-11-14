from database.connection import connect, init_db

def seed():
    init_db()
    conn = connect()
    cursor = conn.cursor()

    # 1. Lojas cadastradas (Plataforma multi-loja ajustável para qualquer comerciante)
    cursor.execute("SELECT COUNT(*) FROM loja")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO loja (id, nome, telefone, endereco_retirada, cep_origem, aceita_entrega, reserva_minutos)
        VALUES 
        (1, 'Salesdrive Mercearia & Loja Central', '(14) 3413-5500', 'Rua Central do Comércio, 100 - Centro', '17500-001', 1, 180),
        (2, 'Empório & Conveniência da Esquina', '(14) 3422-7788', 'Av. das Nações, 450 - Bairro Alto', '17501-000', 1, 120)
        """)

    # 2. Usuários da Loja Física (Lojista e Atendente)
    cursor.execute("SELECT COUNT(*) FROM usuario")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO usuario (id, loja_id, nome, email, senha_hash, papel, ativo)
        VALUES 
        (1, 1, 'Marcos (Lojista)', 'marcos@salesdrive-loja.com', 'hash_simulado', 'dono', 1),
        (2, 1, 'Atendente de Balcão', 'balcao@salesdrive-loja.com', 'hash_simulado', 'atendente', 1)
        """)

    # 3. Clientes Consumidores
    cursor.execute("SELECT COUNT(*) FROM cliente")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO cliente (id, nome, email, telefone, senha_hash, endereco, cep)
        VALUES 
        (1, 'Juliana Mendes', 'juliana.mendes@email.com', '(14) 99777-1122', 'hash_simulado', 'Rua das Flores, 120', '17500000'),
        (2, 'Lucas Ferreira', 'lucas.ferreira@email.com', '(14) 99888-3344', 'hash_simulado', 'Av. Brasil, 890', '17500000'),
        (3, 'Cliente WhatsApp Balcão', 'cliente.zap@loja.com', '(14) 99888-0000', 'hash_simulado', 'Retirada no Balcão', '17500000')
        """)

    # 4. Produtos Variados e Abrangentes (Bebidas, Alimentos, Limpeza, Conveniência)
    cursor.execute("SELECT COUNT(*) FROM produto")
    if cursor.fetchone()[0] == 0:
        produtos = [
            (1, 1, 'Coca-Cola Original 2 Litros Pet', 'BEB-COC-2L', 1190, 48, 0, 'Geladeira 1 - Bebidas', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', 1),
            (2, 1, 'Cerveja Heineken Puro Malte 350ml Lata', 'BEB-HEI-350', 599, 120, 0, 'Geladeira 2 - Cervejas', 'https://images.unsplash.com/photo-1608270191763-71a73e5f2cfc?w=600&auto=format&fit=crop&q=80', 1),
            (3, 1, 'Café Torrado e Moído Pilão Tradicional 500g', 'ALI-CAF-500', 1890, 35, 0, 'Gôndola A2 - Mercearia', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80', 1),
            (4, 1, 'Arroz Tipo 1 Camil 5kg Longo Fino', 'ALI-ARR-5KG', 2990, 40, 0, 'Prateleira Fundo - Alimentos', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', 1),
            (5, 1, 'Detergente Líquido Ypê Neutro 500ml', 'LIM-YPE-500', 299, 90, 0, 'Gôndola C1 - Limpeza', 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=600&auto=format&fit=crop&q=80', 1),
            (6, 1, 'Sabão em Pó OMO Lavagem Perfeita 1.6kg', 'LIM-OMO-16K', 2190, 25, 0, 'Gôndola C2 - Limpeza', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80', 1),
            (7, 1, 'Sabonete Dove Original 90g Barra', 'HIG-DOV-90G', 450, 75, 0, 'Prateleira B1 - Higiene', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80', 1),
            (8, 1, 'Chocolate Bis Lacta Ao Leite 126g', 'DOC-BIS-126', 690, 60, 0, 'Balcão de Caixa - Pote 1', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80', 1),
            (9, 1, 'Água Mineral Crystal Sem Gás 500ml', 'BEB-AGU-500', 250, 80, 0, 'Geladeira 1 - Bebidas', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60', 1),
            (10, 1, 'Pão de Forma Tradicional Pullman 500g', 'ALI-PAO-500', 950, 25, 0, 'Gôndola A1 - Mercearia', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60', 1),
            (11, 1, 'Leite Integral Piracanjuba 1 Litro', 'BEB-LEI-1L', 580, 60, 0, 'Prateleira Fundo - Bebidas', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60', 1),
            (12, 1, 'Creme Dental Colgate Total 12 90g', 'HIG-COL-90G', 690, 45, 0, 'Prateleira B1 - Higiene', 'https://images.unsplash.com/photo-1559567244-809772c67645?w=500&auto=format&fit=crop&q=60', 1),
            (13, 1, 'Papel Higiênico Neve Folha Dupla 4 Rolos', 'LIM-NEV-4UN', 1290, 30, 0, 'Gôndola C3 - Limpeza', 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500&auto=format&fit=crop&q=60', 1)
        ]
        cursor.executemany("""
            INSERT INTO produto (id, loja_id, nome, sku, preco_centavos, estoque_atual, estoque_reservado, local_fisico, imagem_url, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, produtos)

    # 5. Pedidos de Demonstração (Fluxo de Retirada na Loja Física)
    cursor.execute("SELECT COUNT(*) FROM pedido")
    if cursor.fetchone()[0] == 0:
        pedidos = [
            (
                1, 1, 1, 'retirada', None, 'separado', 2380, 0, 2380, 'RET-101',
                '2026-11-14 18:00:00', '2026-11-14 21:00:00'
            ),
            (
                2, 1, 2, 'retirada', None, 'aguardando_pagamento', 1190, 0, 1190, 'RET-102',
                '2026-11-14 18:30:00', '2026-11-14 21:30:00'
            )
        ]
        cursor.executemany("""
            INSERT INTO pedido (id, loja_id, cliente_id, tipo_entrega, cep_destino, status, subtotal_centavos, frete_centavos, total_centavos, codigo_retirada, criado_em, expira_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, pedidos)

        cursor.execute("""
            INSERT INTO pedido_item (loja_id, pedido_id, produto_id, quantidade, preco_unit_centavos, nome_snapshot)
            VALUES 
            (1, 1, 1, 2, 1190, 'Coca-Cola Original 2 Litros Pet')
        """)
        cursor.execute("UPDATE produto SET estoque_reservado = 2 WHERE id = 1")

        cursor.execute("""
            INSERT INTO pagamento (loja_id, pedido_id, metodo, status, valor_centavos, pago_em)
            VALUES (1, 1, 'pix', 'aprovado', 2380, '2026-11-14 18:15:00')
        """)

    conn.close()

if __name__ == "__main__":
    seed()

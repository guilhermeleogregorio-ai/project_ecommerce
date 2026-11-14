from database.connection import connect, init_db

def seed():
    init_db()
    conn = connect()
    cursor = conn.cursor()

    # 1. Loja: Papelaria Modelo (Tray Hackathon) + Loja Segmento 2 (PetShop de Bairro)
    cursor.execute("SELECT COUNT(*) FROM loja")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO loja (id, nome, telefone, endereco_retirada, cep_origem, aceita_entrega, reserva_minutos)
        VALUES 
        (1, 'Papelaria & Bazar Central', '(14) 3413-0000', 'Rua São Luiz, 450 - Centro, Marília/SP', '17500-001', 1, 180),
        (2, 'Pet & Rações do Bairro', '(14) 3422-9988', 'Av. Tiradentes, 820 - Marília/SP', '17501-000', 1, 120)
        """)

    # 2. Usuários da Loja Física (Dono e Atendente de Balcão)
    cursor.execute("SELECT COUNT(*) FROM usuario")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO usuario (id, loja_id, nome, email, senha_hash, papel, ativo)
        VALUES 
        (1, 1, 'Seu Antônio (Lojista)', 'antonio@papelariacentral.com.br', 'hash_simulado', 'dono', 1),
        (2, 1, 'Bruna (Atendente de Balcão)', 'bruna@papelariacentral.com.br', 'hash_simulado', 'atendente', 1)
        """)

    # 3. Clientes Consumidores Finais (B2C)
    cursor.execute("SELECT COUNT(*) FROM cliente")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO cliente (id, nome, email, telefone, senha_hash, endereco, cep)
        VALUES 
        (1, 'Juliana Mendes', 'juliana.mendes@email.com', '(14) 99777-1122', 'hash_simulado', 'Rua das Flores, 120 - Marília/SP', '17500000'),
        (2, 'Lucas Ferreira', 'lucas.ferreira@email.com', '(14) 99888-3344', 'hash_simulado', 'Av. Brasil, 890 - Marília/SP', '17500000'),
        (3, 'Cliente WhatsApp Balcão', 'cliente.zap@papelaria.com', '(14) 99888-0000', 'hash_simulado', 'Retirada no Balcão', '17500000')
        """)

    # 4. Produtos da Papelaria (Itens de alto giro do comércio local com local_fisico no balcão)
    cursor.execute("SELECT COUNT(*) FROM produto")
    if cursor.fetchone()[0] == 0:
        produtos = [
            (1, 1, 'Caderno Universitário Espiral 10 Matérias 200 Fls', 'PAP-CAD-10M', 2890, 45, 0, 'Prateleira A1 - Corredor Central', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 1),
            (2, 1, 'Caneta Esferográfica BIC Cristal Azul 1.0mm', 'PAP-CAN-BIC-AZ', 250, 150, 0, 'Gaveta do Balcão 1', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80', 1),
            (3, 1, 'Mochila Escolar Juvenil Resistente c/ Divisória', 'PAP-MOC-ESC', 14990, 12, 0, 'Expositor Frontal Loja', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 1),
            (4, 1, 'Resma de Papel Sulfite A4 75g Chamex 500 Folhas', 'PAP-SUL-A4', 3290, 60, 0, 'Estoque Balcão Fundo', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', 1),
            (5, 1, 'Kit Marca Texto Pastel Faber-Castell c/ 4 Cores', 'PAP-MAR-FAB-4', 2490, 25, 0, 'Balcão de Atendimento - Pote 2', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80', 1),
            (6, 1, 'Estojo Escolar Duplo Grande', 'PAP-EST-DUP', 1990, 20, 0, 'Prateleira B2', 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80', 1),
            (7, 1, 'Cola Branca Escolar 90g Lavável', 'PAP-COL-90G', 590, 40, 0, 'Prateleira A3', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', 1),
            (8, 1, 'Borracha Branca Faber-Castell com Cinta', 'PAP-BOR-FAB', 350, 80, 0, 'Gaveta do Balcão 2', 'https://images.unsplash.com/photo-1585336261026-621db33f2cf6?w=600&auto=format&fit=crop&q=80', 1)
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
                1, 1, 1, 'retirada', None, 'separado', 5380, 0, 5380, 'RET-101',
                '2026-11-14 18:00:00', '2026-11-14 21:00:00'
            ),
            (
                2, 1, 2, 'retirada', None, 'aguardando_pagamento', 2890, 0, 2890, 'RET-102',
                '2026-11-14 18:30:00', '2026-11-14 21:30:00'
            )
        ]
        cursor.executemany("""
            INSERT INTO pedido (id, loja_id, cliente_id, tipo_entrega, cep_destino, status, subtotal_centavos, frete_centavos, total_centavos, codigo_retirada, criado_em, expira_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, pedidos)

        # Itens do pedido 1
        cursor.execute("""
            INSERT INTO pedido_item (loja_id, pedido_id, produto_id, quantidade, preco_unit_centavos, nome_snapshot)
            VALUES 
            (1, 1, 1, 1, 2890, 'Caderno Universitário Espiral 10 Matérias 200 Fls'),
            (1, 1, 5, 1, 2490, 'Kit Marca Texto Pastel Faber-Castell c/ 4 Cores')
        """)
        # Reserva correspondente
        cursor.execute("UPDATE produto SET estoque_reservado = 1 WHERE id IN (1, 5)")

        # Itens do pedido 2
        cursor.execute("""
            INSERT INTO pedido_item (loja_id, pedido_id, produto_id, quantidade, preco_unit_centavos, nome_snapshot)
            VALUES (1, 2, 1, 1, 2890, 'Caderno Universitário Espiral 10 Matérias 200 Fls')
        """)
        cursor.execute("UPDATE produto SET estoque_reservado = estoque_reservado + 1 WHERE id = 1")

        # Pagamento pedido 1
        cursor.execute("""
            INSERT INTO pagamento (loja_id, pedido_id, metodo, status, valor_centavos, pago_em)
            VALUES (1, 1, 'pix', 'aprovado', 5380, '2026-11-14 18:15:00')
        """)

    conn.close()

if __name__ == "__main__":
    seed()

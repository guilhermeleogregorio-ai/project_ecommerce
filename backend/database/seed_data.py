import sys
from pathlib import Path
from database.connection import connect, init_db

def seed():
    init_db()
    conn = connect()
    cursor = conn.cursor()

    # 1. Loja padrão
    cursor.execute("SELECT COUNT(*) FROM loja")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO loja (id, nome, telefone, endereco_retirada, cep_origem, aceita_entrega, reserva_minutos)
        VALUES (1, 'Salesdrive Distribuidora', '(16) 3344-5500', 'Av. Independência, 2500 - Ribeirão Preto/SP', '14025-000', 1, 120)
        """)

    # 2. Configurações da Loja
    cursor.execute("SELECT COUNT(*) FROM store_settings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO store_settings (
            store_name, trade_name, cnpj, phone, whatsapp, email,
            address, city, state, zip_code, min_order_value,
            pix_discount_percent, enable_boleto, boleto_terms_days, free_shipping_min
        ) VALUES (
            'Salesdrive Distribuidora & Atacado Ltda',
            'Salesdrive Hub Comercial',
            '12.345.678/0001-90',
            '(16) 3344-5500',
            '(16) 99888-7766',
            'contato@salesdrive-hub.com.br',
            'Av. Independência, 2500 - Jardim Califórnia',
            'Ribeirão Preto',
            'SP',
            '14025-000',
            150.00,
            5.0,
            1,
            30,
            450.00
        )
        """)

    # 3. Categorias
    cursor.execute("SELECT COUNT(*) FROM categories")
    if cursor.fetchone()[0] == 0:
        categories = [
            ("Bebidas", "bebidas", "Refrigerantes, sucos, cervejas e águas em fardos e caixas", "Beer"),
            ("Alimentos & Mercearia", "alimentos", "Arroz, feijão, óleos, massas, molhos e enlatados", "Utensils"),
            ("Higiene Pessoal", "higiene", "Sabonetes, cremes dentais, shampoos e desodorantes", "Sparkles"),
            ("Limpeza & Conservação", "limpeza", "Detergentes, desinfetantes, sabão em pó e amaciantes", "ShieldCheck"),
            ("Doces & Confeitaria", "doces", "Chocolates, biscoitos, balas e gomas para ponto de venda", "Candy")
        ]
        cursor.executemany(
            "INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)",
            categories
        )

    # 4. Vendedores
    cursor.execute("SELECT COUNT(*) FROM sellers")
    if cursor.fetchone()[0] == 0:
        sellers = [
            ("Carlos Eduardo Santos", "REP-101", "(16) 99123-4567", "carlos.rep@salesdrive.com.br", "Ribeirão Preto e Região", 3.5, 60000.0, 42800.0),
            ("Mariana Oliveira Costa", "REP-102", "(16) 99234-5678", "mariana.rep@salesdrive.com.br", "Franca e Araraquara", 4.0, 75000.0, 68500.0),
            ("Rodrigo Silveira Mendes", "REP-103", "(16) 99345-6789", "rodrigo.rep@salesdrive.com.br", "São Carlos e Sertãozinho", 3.5, 50000.0, 31200.0)
        ]
        cursor.executemany(
            """INSERT INTO sellers 
            (name, code, phone, email, region, commission_rate, monthly_goal, current_sales) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            sellers
        )

    # 5. Clientes
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        customers = [
            (
                "Mercado & Mercearia Bom Preço",
                "Supermercado Bom Preço Ltda",
                "28.491.023/0001-44",
                "compras@mercadobompreco.com.br",
                "(16) 3622-1100",
                "Rua Duque de Caxias",
                "840",
                "Centro",
                "Ribeirão Preto",
                "SP",
                "14015-020",
                12000.0,
                3450.0
            ),
            (
                "Padaria e Conveniência Estrela D'Alva",
                "Panificadora Estrela D'Alva ME",
                "19.822.441/0001-18",
                "contato@padariaestrela.com.br",
                "(16) 3630-9922",
                "Av. Presidente Vargas",
                "1220",
                "Alto da Boa Vista",
                "Ribeirão Preto",
                "SP",
                "14025-700",
                8000.0,
                1890.0
            ),
            (
                "Empório da Esquina Alimentos",
                "Empório da Esquina Comércio Varejista",
                "34.120.987/0001-52",
                "financeiro@emporiodaesquina.com.br",
                "(16) 3911-4433",
                "Rua São Sebastião",
                "450",
                "Vila Tibério",
                "Ribeirão Preto",
                "SP",
                "14050-010",
                6000.0,
                850.0
            ),
            (
                "Mini Mercado São Jorge",
                "São Jorge Varejo e Conveniência ME",
                "41.776.321/0001-99",
                "saojorge@gmail.com",
                "(16) 3662-8010",
                "Av. Saudade",
                "980",
                "Campos Elíseos",
                "Ribeirão Preto",
                "SP",
                "14080-000",
                5000.0,
                0.0
            )
        ]
        cursor.executemany(
            """INSERT INTO customers 
            (name, company_name, document, email, phone, address, number, neighborhood, city, state, zip_code, credit_limit, credit_used)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            customers
        )

    # 6. Produtos
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        products = [
            ("Coca-Cola Original 2L (Fardo c/ 6 unidades)", "BEB-COC-2L-FD6", 1, "Bebidas", "Fardo com 6 garrafas pet de 2 Litros.", 46.90, 43.90, "FD", 1, 6, 120, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80", 1, 1),
            ("Água Mineral Crystal Sem Gás 500ml (Fardo c/ 12)", "BEB-AGU-500-FD12", 1, "Bebidas", "Fardo com 12 garrafas pet 500ml sem gás.", 18.90, 16.50, "FD", 2, 12, 85, "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80", 1, 0),
            ("Cerveja Heineken Puro Malte 350ml (Pack c/ 12 Latas)", "BEB-HEI-350-PK12", 1, "Bebidas", "Pack com 12 latas sleek 350ml.", 59.90, None, "PK", 1, 12, 60, "https://images.unsplash.com/photo-1608270191763-71a73e5f2cfc?w=600&auto=format&fit=crop&q=80", 1, 1),
            ("Suco Del Valle Uva 1 Litro (Caixa c/ 6 unidades)", "BEB-SUC-1L-CX6", 1, "Bebidas", "Caixa com 6 caixas tetra pak 1L.", 38.50, 34.90, "CX", 1, 6, 40, "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80", 1, 0),
            ("Arroz Tipo 1 Camil 5kg (Fardo c/ 6 pacotes)", "ALI-ARR-5KG-FD6", 2, "Alimentos & Mercearia", "Fardo de arroz agulhinha longo fino 5kg c/ 6 pacotes.", 159.90, 152.00, "FD", 1, 6, 50, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80", 1, 1),
            ("Feijão Carioca Camil 1kg (Fardo c/ 10 pacotes)", "ALI-FEI-1KG-FD10", 2, "Alimentos & Mercearia", "Fardo de feijão carioca novo tipo 1 c/ 10 pacotes.", 74.90, 69.90, "FD", 1, 10, 45, "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80", 1, 1),
            ("Óleo de Soja Liza 900ml (Caixa c/ 20 unidades)", "ALI-OLE-900-CX20", 2, "Alimentos & Mercearia", "Caixa com 20 garrafas pet 900ml.", 138.00, None, "CX", 1, 20, 30, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80", 1, 0),
            ("Café Torrado e Moído Pilão Tradicional 500g (Caixa c/ 20 un)", "ALI-CAF-500-CX20", 2, "Alimentos & Mercearia", "Caixa com 20 pacotes a vácuo de 500g.", 322.00, 299.00, "CX", 1, 20, 25, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80", 1, 1),
            ("Sabonete Dove Original 90g (Caixa c/ 24 unidades)", "HIG-DOV-90G-CX24", 3, "Higiene Pessoal", "Caixa mista/original com 24 barras 90g.", 89.90, 84.90, "CX", 1, 24, 70, "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80", 1, 0),
            ("Creme Dental Colgate Total 12 90g (Caixa c/ 12 un)", "HIG-COL-90G-CX12", 3, "Higiene Pessoal", "Caixa com 12 tubos de 90g antibacteriano.", 63.50, None, "CX", 1, 12, 90, "https://images.unsplash.com/photo-1559591937-e102203138b2?w=600&auto=format&fit=crop&q=80", 1, 1),
            ("Detergente Líquido Ypê Neutro 500ml (Caixa c/ 24 unidades)", "LIM-YPE-500-CX24", 4, "Limpeza & Conservação", "Caixa com 24 frascos de 500ml.", 49.90, 45.90, "CX", 1, 24, 110, "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=600&auto=format&fit=crop&q=80", 1, 0),
            ("Sabão em Pó OMO Lavagem Perfeita 1.6kg (Caixa c/ 8 unidades)", "LIM-OMO-16K-CX8", 4, "Limpeza & Conservação", "Caixa com 8 caixas de 1.6kg.", 144.00, 136.00, "CX", 1, 8, 40, "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80", 1, 1),
            ("Chocolate Bis Lacta Ao Leite 126g (Display c/ 16 unidades)", "DOC-BIS-126-DP16", 5, "Doces & Confeitaria", "Display expositor para caixa de varejo com 16 unidades.", 87.90, 79.90, "DP", 1, 16, 65, "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80", 1, 1)
        ]
        cursor.executemany(
            """INSERT INTO products 
            (name, sku, category_id, category_name, description, price, promo_price, unit, min_quantity, box_quantity, stock, image_url, is_active, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            products
        )

    # 7. Cupons
    cursor.execute("SELECT COUNT(*) FROM coupons")
    if cursor.fetchone()[0] == 0:
        coupons = [
            ("BEMVINDO", 10.0, None, 100.0, 1),
            ("VAREJO5", 5.0, None, 50.0, 1),
            ("FRETEGRATIS", None, 30.0, 250.0, 1),
            ("PRIMEIRACOMPRA", 10.0, None, 150.0, 1)
        ]
        cursor.executemany(
            "INSERT INTO coupons (code, discount_percent, fixed_discount, min_order_value, is_active) VALUES (?, ?, ?, ?, ?)",
            coupons
        )

    # 8. Pedidos de demonstração
    cursor.execute("SELECT COUNT(*) FROM orders")
    if cursor.fetchone()[0] == 0:
        orders = [
            (
                "SD-2026-00101", 1, "Mercado & Mercearia Bom Preço", "28.491.023/0001-44", "(16) 3622-1100", "compras@mercadobompreco.com.br",
                1, "Carlos Eduardo Santos", 607.20, 30.36, 0.0, 576.84, "PIX", "PAID", "DELIVERED", "VAREJO5",
                "Entregar na doca dos fundos.", "Rua Duque de Caxias, 840 - Ribeirão Preto/SP", "2026-11-11 10:30:00"
            ),
            (
                "SD-2026-00102", 2, "Padaria e Conveniência Estrela D'Alva", "19.822.441/0001-18", "(16) 3630-9922", "contato@padariaestrela.com.br",
                2, "Mariana Oliveira Costa", 389.70, 19.48, 25.0, 395.22, "PIX", "PAID", "BILLED", None,
                "Comprovante PIX conferido.", "Av. Presidente Vargas, 1220 - Ribeirão Preto/SP", "2026-11-12 14:15:00"
            ),
            (
                "SD-2026-00103", 3, "Empório da Esquina Alimentos", "34.120.987/0001-52", "(16) 3911-4433", "financeiro@emporiodaesquina.com.br",
                1, "Carlos Eduardo Santos", 528.00, 52.80, 0.0, 475.20, "CREDIT_CARD", "PAID", "SEPARATION", "PRIMEIRACOMPRA",
                "Primeira compra no canal online.", "Rua São Sebastião, 450 - Ribeirão Preto/SP", "2026-11-13 16:40:00"
            ),
            (
                "SD-2026-00104", 4, "Mini Mercado São Jorge", "41.776.321/0001-99", "(16) 3662-8010", "saojorge@gmail.com",
                3, "Rodrigo Silveira Mendes", 288.60, 0.0, 20.0, 308.60, "PIX", "PENDING", "PENDING", None,
                "Aguardando confirmação do pagamento via PIX.", "Av. Saudade, 980 - Ribeirão Preto/SP", "2026-11-14 11:20:00"
            )
        ]
        for ord in orders:
            cursor.execute("""
            INSERT INTO orders (
                order_number, customer_id, customer_name, customer_document,
                customer_phone, customer_email, seller_id, seller_name,
                subtotal, discount, shipping_fee, total, payment_method,
                payment_status, status, coupon_code, notes, shipping_address, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, ord)
            order_id = cursor.lastrowid

            if ord[0] == "SD-2026-00101":
                cursor.execute("""
                INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, total_price, image_url)
                VALUES 
                (?, 1, 'Coca-Cola Original 2L (Fardo c/ 6 unidades)', 'BEB-COC-2L-FD6', 46.90, 4, 187.60, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80'),
                (?, 5, 'Arroz Tipo 1 Camil 5kg (Fardo c/ 6 pacotes)', 'ALI-ARR-5KG-FD6', 159.90, 2, 319.80, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80')
                """, (order_id, order_id))

    conn.close()

if __name__ == "__main__":
    seed()

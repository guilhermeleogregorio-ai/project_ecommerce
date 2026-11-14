import sys
from pathlib import Path

# Suporte para execução direta ou como módulo
try:
    from .connection import get_db_connection, init_db
except ImportError:
    backend_dir = Path(__file__).resolve().parent.parent
    sys.path.insert(0, str(backend_dir))
    from database.connection import get_db_connection, init_db

def seed():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Verifica se já há dados
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] > 0:
        print("Banco de dados já contém registros. Pulando seed.")
        conn.close()
        return

    print("Populando banco de dados com dados reais para o MVP Salesdrive...")

    # 1. Configurações da Loja
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

    # 2. Categorias
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

    # 3. Vendedores / Representantes Comerciais
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

    # 4. Clientes / Varejistas Locais
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

    # 5. Produtos
    products = [
        # Bebidas
        (
            "Coca-Cola Original 2L (Fardo c/ 6 unidades)",
            "BEB-COC-2L-FD6",
            1,
            "Bebidas",
            "Refrigerante Coca-Cola 2 Litros pet. Fardo lacrado contendo 6 garrafas. Ideal para reposição de gôndola.",
            49.90,
            46.90,
            "FD",
            1,
            6,
            120,
            "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
            1,
            1
        ),
        (
            "Água Mineral Crystal Sem Gás 510ml (Fardo c/ 12 unidades)",
            "BEB-AGU-510-FD12",
            1,
            "Bebidas",
            "Água mineral natural sem gás, embalagem prática de 510ml. Alta rotatividade para balcão e geladeira.",
            19.80,
            17.90,
            "FD",
            2,
            12,
            240,
            "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80",
            1,
            0
        ),
        (
            "Cerveja Heineken Puro Malte 350ml (Pack c/ 12 Latas)",
            "BEB-HEI-350-PK12",
            1,
            "Bebidas",
            "Cerveja premium puro malte Heineken lata sleek 350ml. Pack com 12 unidades com garantia de procedência.",
            64.50,
            59.90,
            "PK",
            1,
            12,
            85,
            "https://images.unsplash.com/photo-1608270191763-71a73e5f2cfc?w=600&auto=format&fit=crop&q=80",
            1,
            1
        ),
        (
            "Suco de Laranja Integral 900ml (Caixa c/ 6 unidades)",
            "BEB-SUC-900-CX6",
            1,
            "Bebidas",
            "Suco 100% natural sem adição de açúcares ou conservantes. Garrafa pet com tampa dosadora.",
            42.00,
            38.50,
            "CX",
            1,
            6,
            90,
            "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80",
            1,
            0
        ),

        # Alimentos
        (
            "Arroz Tipo 1 Camil 5kg (Fardo c/ 6 pacotes)",
            "ALI-ARR-5KG-FD6",
            2,
            "Alimentos & Mercearia",
            "Arroz branco longo fino tipo 1. Grãos selecionados com padrão classe exportação. Fardo com 30kg total.",
            168.00,
            159.90,
            "FD",
            1,
            6,
            75,
            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
            1,
            1
        ),
        (
            "Feijão Carioca Kicaldo 1kg (Fardo c/ 10 pacotes)",
            "ALI-FEI-1KG-FD10",
            2,
            "Alimentos & Mercearia",
            "Feijão carioca novo de cozimento rápido e caldo denso. Embalagem com atmosfera protegida.",
            79.90,
            74.90,
            "FD",
            1,
            10,
            110,
            "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80",
            1,
            0
        ),
        (
            "Óleo de Soja Liza 900ml (Caixa c/ 20 unidades)",
            "ALI-OLE-900-CX20",
            2,
            "Alimentos & Mercearia",
            "Óleo vegetal de soja 100% refinado e puro. Produto essencial na cesta de abastecimento.",
            135.00,
            128.00,
            "CX",
            1,
            20,
            95,
            "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
            1,
            1
        ),
        (
            "Café Torrado e Moído Pilão Tradicional 500g (Caixa c/ 20 un)",
            "ALI-CAF-500-CX20",
            2,
            "Alimentos & Mercearia",
            "O café forte do Brasil. Embalagem almofada selada a vácuo para preservação de aroma.",
            340.00,
            322.00,
            "CX",
            1,
            20,
            60,
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
            1,
            1
        ),

        # Higiene
        (
            "Sabonete em Barra Dove Original 90g (Display c/ 16 un)",
            "HIG-DOV-90G-DP16",
            3,
            "Higiene Pessoal",
            "Sabonete hidratante com 1/4 de creme hidrante. Embalagem unitária individual para venda de varejo.",
            58.90,
            54.00,
            "DP",
            1,
            16,
            130,
            "https://images.unsplash.com/photo-1607006314605-feed201f9c8f?w=600&auto=format&fit=crop&q=80",
            1,
            0
        ),
        (
            "Creme Dental Colgate Total 12 90g (Caixa c/ 12 un)",
            "HIG-COL-90G-CX12",
            3,
            "Higiene Pessoal",
            "Proteção antibacteriana por até 12 horas. Marca líder em vendas no segmento bucal.",
            69.90,
            63.50,
            "CX",
            1,
            12,
            140,
            "https://images.unsplash.com/photo-1559591937-e102203138b2?w=600&auto=format&fit=crop&q=80",
            1,
            0
        ),

        # Limpeza
        (
            "Detergente Líquido Ypê Neutro 500ml (Caixa c/ 24 unidades)",
            "LIM-YPE-500-CX24",
            4,
            "Limpeza & Conservação",
            "Detergente biodegradável de alta rentabilidade. Líder absoluto em preferência no varejo.",
            55.20,
            49.90,
            "CX",
            1,
            24,
            160,
            "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=600&auto=format&fit=crop&q=80",
            1,
            1
        ),
        (
            "Sabão em Pó OMO Lavagem Perfeita 1.6kg (Caixa c/ 8 unidades)",
            "LIM-OMO-16K-CX8",
            4,
            "Limpeza & Conservação",
            "Poder de limpeza profundo com tecnologia anti-manchas. Embalagem econômica para família.",
            152.00,
            144.00,
            "CX",
            1,
            8,
            80,
            "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80",
            1,
            0
        ),

        # Doces
        (
            "Chocolate Bis Lacta Ao Leite 126g (Display c/ 16 unidades)",
            "DOC-BIS-126-DP16",
            5,
            "Doces & Confeitaria",
            "Wafer crocante coberto com chocolate ao leite. Produto campeão de checkout e compra por impulso.",
            94.40,
            87.90,
            "DP",
            1,
            16,
            180,
            "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80",
            1,
            1
        )
    ]

    cursor.executemany(
        """INSERT INTO products 
        (name, sku, category_id, category_name, description, price, promo_price, unit, min_quantity, box_quantity, stock, image_url, is_active, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        products
    )

    # 6. Cupons
    coupons = [
        ("PRIMEIRACOMPRA", 10.0, None, 200.0, 1),
        ("SALESDRIVE5", 5.0, None, 150.0, 1),
        ("FRETEGRATIS", 0.0, 25.0, 300.0, 1)
    ]
    cursor.executemany(
        "INSERT INTO coupons (code, discount_percent, fixed_discount, min_order_value, is_active) VALUES (?, ?, ?, ?, ?)",
        coupons
    )

    # 7. Pedidos de Demonstração
    orders = [
        (
            "SD-2026-00101",
            1,
            "Mercado & Mercearia Bom Preço",
            "28.491.023/0001-44",
            "(16) 3622-1100",
            "compras@mercadobompreco.com.br",
            1,
            "Carlos Eduardo Santos",
            642.80,
            32.14,
            0.0,
            610.66,
            "BOLETO",
            "PAID",
            "DELIVERED",
            "SALESDRIVE5",
            "Entregar na doca dos fundos até as 11h.",
            "Rua Duque de Caxias, 840, Centro - Ribeirão Preto/SP",
            "2026-11-10 09:30:00"
        ),
        (
            "SD-2026-00102",
            2,
            "Padaria e Conveniência Estrela D'Alva",
            "19.822.441/0001-18",
            "(16) 3630-9922",
            "contato@padariaestrela.com.br",
            2,
            "Mariana Oliveira Costa",
            389.70,
            19.48,
            25.0,
            395.22,
            "PIX",
            "PAID",
            "BILLED",
            None,
            "Comprovante PIX conferido automaticamente.",
            "Av. Presidente Vargas, 1220 - Ribeirão Preto/SP",
            "2026-11-12 14:15:00"
        ),
        (
            "SD-2026-00103",
            3,
            "Empório da Esquina Alimentos",
            "34.120.987/0001-52",
            "(16) 3911-4433",
            "financeiro@emporiodaesquina.com.br",
            1,
            "Carlos Eduardo Santos",
            528.00,
            52.80,
            0.0,
            475.20,
            "CREDIT_CARD",
            "PAID",
            "SEPARATION",
            "PRIMEIRACOMPRA",
            "Primeira compra no canal online.",
            "Rua São Sebastião, 450 - Ribeirão Preto/SP",
            "2026-11-13 16:40:00"
        ),
        (
            "SD-2026-00104",
            4,
            "Mini Mercado São Jorge",
            "41.776.321/0001-99",
            "(16) 3662-8010",
            "saojorge@gmail.com",
            3,
            "Rodrigo Silveira Mendes",
            288.60,
            0.0,
            20.0,
            308.60,
            "PIX",
            "PENDING",
            "PENDING",
            None,
            "Aguardando confirmação do pagamento via PIX.",
            "Av. Saudade, 980 - Ribeirão Preto/SP",
            "2026-11-14 11:20:00"
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
            (?, 5, 'Arroz Tipo 1 Camil 5kg (Fardo c/ 6 pacotes)', 'ALI-ARR-5KG-FD6', 159.90, 2, 319.80, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'),
            (?, 11, 'Detergente Líquido Ypê Neutro 500ml (Caixa c/ 24 unidades)', 'LIM-YPE-500-CX24', 49.90, 2, 99.80, 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=600&auto=format&fit=crop&q=80')
            """, (order_id, order_id, order_id))
        elif ord[0] == "SD-2026-00102":
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, total_price, image_url)
            VALUES 
            (?, 8, 'Café Torrado e Moído Pilão Tradicional 500g (Caixa c/ 20 un)', 'ALI-CAF-500-CX20', 322.00, 1, 322.00, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80'),
            (?, 10, 'Creme Dental Colgate Total 12 90g (Caixa c/ 12 un)', 'HIG-COL-90G-CX12', 63.50, 1, 63.50, 'https://images.unsplash.com/photo-1559591937-e102203138b2?w=600&auto=format&fit=crop&q=80')
            """, (order_id, order_id))
        elif ord[0] == "SD-2026-00103":
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, total_price, image_url)
            VALUES 
            (?, 3, 'Cerveja Heineken Puro Malte 350ml (Pack c/ 12 Latas)', 'BEB-HEI-350-PK12', 59.90, 4, 239.60, 'https://images.unsplash.com/photo-1608270191763-71a73e5f2cfc?w=600&auto=format&fit=crop&q=80'),
            (?, 13, 'Chocolate Bis Lacta Ao Leite 126g (Display c/ 16 unidades)', 'DOC-BIS-126-DP16', 87.90, 3, 263.70, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80')
            """, (order_id, order_id))
        elif ord[0] == "SD-2026-00104":
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, total_price, image_url)
            VALUES 
            (?, 12, 'Sabão em Pó OMO Lavagem Perfeita 1.6kg (Caixa c/ 8 unidades)', 'LIM-OMO-16K-CX8', 144.00, 2, 288.00, 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80')
            """, (order_id,))

    conn.commit()
    conn.close()
    print("Seed finalizado com sucesso!")

if __name__ == "__main__":
    seed()

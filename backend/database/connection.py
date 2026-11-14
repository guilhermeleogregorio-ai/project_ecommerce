import os, sqlite3
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH") or os.path.join(os.path.dirname(__file__), "loja.db")

def connect():
    c = sqlite3.connect(DB_PATH, isolation_level=None)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys=ON")
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA busy_timeout=5000")
    return c 

def init_db():
    c = connect()
    
    # 1. Tabelas de Governança, Transações e Auditoria (Arquitetura Própria)
    c.execute("""
    CREATE TABLE IF NOT EXISTS loja (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT,
        endereco_retirada TEXT,
        cep_origem TEXT,
        aceita_entrega INTEGER NOT NULL DEFAULT 1,
        reserva_minutos INTEGER NOT NULL DEFAULT 120
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS auditoria_evento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loja_id INTEGER NOT NULL DEFAULT 1,
        agente_execucao_id INTEGER,
        usuario_id INTEGER,
        correlation_id TEXT,
        entidade TEXT NOT NULL,
        entidade_id INTEGER NOT NULL,
        acao TEXT NOT NULL,
        dados_anteriores TEXT,
        dados_posteriores TEXT,
        detalhes TEXT,
        origem TEXT NOT NULL DEFAULT 'sistema',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS agente_execucao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loja_id INTEGER NOT NULL DEFAULT 1,
        usuario_id INTEGER,
        agente TEXT NOT NULL,
        versao_agente TEXT,
        modelo_ia TEXT,
        correlation_id TEXT,
        solicitacao TEXT,
        resultado TEXT,
        status TEXT NOT NULL DEFAULT 'iniciado',
        iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finalizado_em TIMESTAMP
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS movimento_estoque (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loja_id INTEGER NOT NULL DEFAULT 1,
        produto_id INTEGER NOT NULL,
        pedido_id INTEGER,
        agente_execucao_id INTEGER,
        tipo TEXT NOT NULL,
        direcao TEXT NOT NULL,
        quantidade INTEGER NOT NULL,
        estoque_antes INTEGER NOT NULL,
        estoque_depois INTEGER NOT NULL,
        origem TEXT NOT NULL DEFAULT 'sistema',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Tabelas de Domínio e E-commerce (Consumidas pelo Frontend)
    c.execute("""
    CREATE TABLE IF NOT EXISTS store_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_name TEXT NOT NULL,
        trade_name TEXT,
        cnpj TEXT,
        phone TEXT,
        whatsapp TEXT,
        email TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        min_order_value REAL DEFAULT 0.0,
        pix_discount_percent REAL DEFAULT 5.0,
        enable_boleto INTEGER DEFAULT 1,
        boleto_terms_days INTEGER DEFAULT 30,
        free_shipping_min REAL DEFAULT 300.0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT NOT NULL UNIQUE,
        category_id INTEGER,
        category_name TEXT,
        description TEXT,
        price REAL NOT NULL,
        promo_price REAL,
        unit TEXT DEFAULT 'UN',
        min_quantity INTEGER DEFAULT 1,
        box_quantity INTEGER DEFAULT 1,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        featured INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company_name TEXT,
        document TEXT NOT NULL UNIQUE,
        email TEXT,
        phone TEXT,
        address TEXT,
        number TEXT,
        neighborhood TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        credit_limit REAL DEFAULT 5000.0,
        credit_used REAL DEFAULT 0.0,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS sellers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        phone TEXT,
        email TEXT,
        region TEXT,
        commission_rate REAL DEFAULT 3.5,
        monthly_goal REAL DEFAULT 50000.0,
        current_sales REAL DEFAULT 0.0,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT NOT NULL UNIQUE,
        customer_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_document TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        seller_id INTEGER,
        seller_name TEXT,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0.0,
        shipping_fee REAL DEFAULT 0.0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'PENDING',
        status TEXT DEFAULT 'PENDING',
        coupon_code TEXT,
        notes TEXT,
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (seller_id) REFERENCES sellers (id)
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        product_sku TEXT,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL,
        image_url TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
    );
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        discount_percent REAL,
        fixed_discount REAL,
        min_order_value REAL DEFAULT 0.0,
        is_active INTEGER DEFAULT 1
    );
    """)

    c.close()

@contextmanager
def tx():
    """
    Transação com BEGIN IMMEDIATE: serializa escritores no SQLite para evitar race condition.
    """
    c = connect()
    c.execute("BEGIN IMMEDIATE")
    try:
        yield c
        c.execute("COMMIT")
    except BaseException:
        c.execute("ROLLBACK")
        raise
    finally:
        c.close()

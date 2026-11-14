import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "ecommerce.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Tabela de Configurações da Loja
    cursor.execute("""
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

    # Tabela de Categorias
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT
    );
    """)

    # Tabela de Produtos
    cursor.execute("""
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

    # Tabela de Clientes / Varejistas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company_name TEXT,
        document TEXT NOT NULL UNIQUE, -- CNPJ ou CPF
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

    # Tabela de Vendedores / Representantes Comerciais
    cursor.execute("""
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

    # Tabela de Pedidos
    cursor.execute("""
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
        payment_method TEXT NOT NULL, -- PIX, BOLETO, CREDIT_CARD
        payment_status TEXT DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED
        status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, SEPARATION, BILLED, DELIVERED, CANCELLED
        coupon_code TEXT,
        notes TEXT,
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (seller_id) REFERENCES sellers (id)
    );
    """)

    # Itens do Pedido
    cursor.execute("""
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

    # Cupons de Desconto
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        discount_percent REAL,
        fixed_discount REAL,
        min_order_value REAL DEFAULT 0.0,
        is_active INTEGER DEFAULT 1
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Banco de dados SQLite inicializado com sucesso!")

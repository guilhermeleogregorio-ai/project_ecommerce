from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from database.connection import tx
from models.core import Ctx, auditar
from models.estoque import registrar_movimento

router = APIRouter(tags=["products"])

class ProductCreate(BaseModel):
    name: str
    sku: str
    category_id: int | None = None
    category_name: str | None = None
    description: str | None = None
    price: float = Field(gt=0)
    promo_price: float | None = None
    unit: str = "UN"
    min_quantity: int = 1
    box_quantity: int = 1
    stock: int = 0
    image_url: str | None = None
    is_active: bool = True
    featured: bool = False

class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    category_id: int | None = None
    category_name: str | None = None
    description: str | None = None
    price: float | None = None
    promo_price: float | None = None
    unit: str | None = None
    min_quantity: int | None = None
    box_quantity: int | None = None
    stock: int | None = None
    image_url: str | None = None
    is_active: bool | None = None
    featured: bool | None = None

@router.get("/categories")
def list_categories():
    with tx() as conn:
        rows = conn.execute("SELECT * FROM categories ORDER BY name ASC").fetchall()
        return [dict(r) for r in rows]

@router.get("/products")
def list_products(
    category_id: int | None = Query(None),
    search: str | None = Query(None),
    featured: bool | None = Query(None),
    active_only: bool | None = Query(None)
):
    with tx() as conn:
        query = "SELECT * FROM products WHERE 1=1"
        params = []

        if category_id is not None:
            query += " AND category_id = ?"
            params.append(category_id)

        if active_only:
            query += " AND is_active = 1"

        if featured is not None:
            query += " AND featured = ?"
            params.append(1 if featured else 0)

        if search:
            query += " AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s])

        query += " ORDER BY featured DESC, id DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]

@router.get("/products/{product_id}")
def get_product(product_id: int):
    with tx() as conn:
        row = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        return dict(row)

@router.post("/products", status_code=201)
def create_product(data: ProductCreate):
    with tx() as conn:
        # Pega o nome da categoria se fornecido apenas o id
        cat_name = data.category_name
        if data.category_id and not cat_name:
            cat = conn.execute("SELECT name FROM categories WHERE id = ?", (data.category_id,)).fetchone()
            if cat:
                cat_name = cat["name"]

        try:
            cursor = conn.execute("""
            INSERT INTO products 
            (name, sku, category_id, category_name, description, price, promo_price, unit, min_quantity, box_quantity, stock, image_url, is_active, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data.name, data.sku, data.category_id, cat_name, data.description,
                data.price, data.promo_price, data.unit, data.min_quantity, data.box_quantity,
                data.stock, data.image_url, 1 if data.is_active else 0, 1 if data.featured else 0
            ))
            prod_id = cursor.lastrowid
            
            # Auditoria e Movimento inicial de Estoque
            ctx = Ctx(loja_id=1)
            if data.stock > 0:
                registrar_movimento(conn, ctx, prod_id, None, "entrada", "entrada", data.stock, 0, data.stock)
            
            created = dict(conn.execute("SELECT * FROM products WHERE id = ?", (prod_id,)).fetchone())
            auditar(conn, ctx, "produto", prod_id, "criar", None, created)
            return created
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erro ao criar produto: {e}")

@router.put("/products/{product_id}")
def update_product(product_id: int, data: ProductUpdate):
    with tx() as conn:
        current = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        current_dict = dict(current)

        updates = {}
        for field, value in data.model_dump(exclude_unset=True).items():
            if field == "is_active":
                updates["is_active"] = 1 if value else 0
            elif field == "featured":
                updates["featured"] = 1 if value else 0
            else:
                updates[field] = value

        if data.category_id and not data.category_name:
            cat = conn.execute("SELECT name FROM categories WHERE id = ?", (data.category_id,)).fetchone()
            if cat:
                updates["category_name"] = cat["name"]

        if updates:
            sets = ", ".join(f"{k} = ?" for k in updates.keys())
            conn.execute(f"UPDATE products SET {sets} WHERE id = ?", (*updates.values(), product_id))

        # Se houve alteração de estoque, registra movimento
        ctx = Ctx(loja_id=1)
        if "stock" in updates and updates["stock"] != current_dict["stock"]:
            diff = updates["stock"] - current_dict["stock"]
            direcao = "entrada" if diff > 0 else "saida"
            registrar_movimento(conn, ctx, product_id, None, "ajuste", direcao, abs(diff), current_dict["stock"], updates["stock"])

        after = dict(conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone())
        auditar(conn, ctx, "produto", product_id, "atualizar", current_dict, after)
        return after

@router.delete("/products/{product_id}")
def delete_product(product_id: int):
    with tx() as conn:
        current = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        # Soft delete desativando o produto
        conn.execute("UPDATE products SET is_active = 0 WHERE id = ?", (product_id,))
        ctx = Ctx(loja_id=1)
        auditar(conn, ctx, "produto", product_id, "deletar_soft", dict(current), {"is_active": 0})
        return {"success": True, "message": "Produto desativado com sucesso"}

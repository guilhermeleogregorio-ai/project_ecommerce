from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.connection import tx
from models.core import Ctx, auditar

router = APIRouter(tags=["settings"])

class SettingsUpdate(BaseModel):
    store_name: str | None = None
    trade_name: str | None = None
    cnpj: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    email: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    min_order_value: float | None = None
    pix_discount_percent: float | None = None
    enable_boleto: int | bool | None = None
    boleto_terms_days: int | None = None
    free_shipping_min: float | None = None

class CouponValidateIn(BaseModel):
    code: str
    subtotal: float

@router.get("/settings")
def get_settings():
    with tx() as conn:
        row = conn.execute("SELECT * FROM store_settings ORDER BY id ASC LIMIT 1").fetchone()
        if not row:
            # Fallback seguro
            return {
                "store_name": "Salesdrive Distribuidora",
                "trade_name": "Salesdrive Hub",
                "min_order_value": 150.0,
                "pix_discount_percent": 5.0,
                "enable_boleto": 1,
                "boleto_terms_days": 30,
                "free_shipping_min": 450.0
            }
        return dict(row)

@router.put("/settings")
def update_settings(data: SettingsUpdate):
    with tx() as conn:
        row = conn.execute("SELECT * FROM store_settings ORDER BY id ASC LIMIT 1").fetchone()
        updates = data.model_dump(exclude_unset=True)
        if "enable_boleto" in updates and isinstance(updates["enable_boleto"], bool):
            updates["enable_boleto"] = 1 if updates["enable_boleto"] else 0

        if row:
            if updates:
                sets = ", ".join(f"{k} = ?" for k in updates.keys())
                conn.execute(f"UPDATE store_settings SET {sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (*updates.values(), row["id"]))
            sid = row["id"]
        else:
            cols = ", ".join(updates.keys())
            places = ", ".join("?" for _ in updates)
            cur = conn.execute(f"INSERT INTO store_settings ({cols}) VALUES ({places})", list(updates.values()))
            sid = cur.lastrowid

        ctx = Ctx(loja_id=1)
        res = dict(conn.execute("SELECT * FROM store_settings WHERE id = ?", (sid,)).fetchone())
        auditar(conn, ctx, "configuracao", sid, "atualizar", None, res)
        return res

@router.post("/coupons/validate")
def validate_coupon(data: CouponValidateIn):
    with tx() as conn:
        coupon = conn.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (data.code.upper().strip(),)).fetchone()
        if not coupon:
            raise HTTPException(status_code=400, detail="Cupom inválido ou expirado")
        
        c = dict(coupon)
        if data.subtotal < c["min_order_value"]:
            raise HTTPException(
                status_code=400,
                detail=f"Pedido mínimo para este cupom é de R$ {c['min_order_value']:.2f}"
            )
        
        # Calcula desconto
        discount = 0.0
        if c["discount_percent"]:
            discount = round(data.subtotal * (c["discount_percent"] / 100), 2)
        elif c["fixed_discount"]:
            discount = min(c["fixed_discount"], data.subtotal)

        return {
            "valid": True,
            "code": c["code"],
            "discount": discount,
            "discount_percent": c["discount_percent"],
            "fixed_discount": c["fixed_discount"]
        }

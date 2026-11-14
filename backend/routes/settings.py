from fastapi import APIRouter, HTTPException
from datetime import datetime

try:
    from backend.database.connection import get_db_connection
    from backend.schemas.settings import (
        StoreSettingsUpdate,
        StoreSettingsResponse,
        CouponValidateRequest,
        CouponValidateResponse
    )
except ImportError:
    from database.connection import get_db_connection
    from schemas.settings import (
        StoreSettingsUpdate,
        StoreSettingsResponse,
        CouponValidateRequest,
        CouponValidateResponse
    )

router = APIRouter(prefix="/api", tags=["Configurações & Cupons"])

@router.get("/settings", response_model=StoreSettingsResponse)
def get_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM store_settings ORDER BY id ASC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Configurações não encontradas")
    
    d = dict(row)
    d["enable_boleto"] = bool(d["enable_boleto"])
    return d

@router.put("/settings", response_model=StoreSettingsResponse)
def update_settings(settings: StoreSettingsUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM store_settings ORDER BY id ASC LIMIT 1")
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Configurações não encontradas")

    settings_id = row["id"]
    updates = ["updated_at = ?"]
    params = [datetime.now().strftime("%Y-%m-%d %H:%M:%S")]

    for field, val in settings.dict(exclude_unset=True).items():
        if field == "enable_boleto":
            updates.append("enable_boleto = ?")
            params.append(1 if val else 0)
        else:
            updates.append(f"{field} = ?")
            params.append(val)

    params.append(settings_id)
    cursor.execute(f"UPDATE store_settings SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()

    cursor.execute("SELECT * FROM store_settings WHERE id = ?", (settings_id,))
    updated_row = cursor.fetchone()
    conn.close()

    d = dict(updated_row)
    d["enable_boleto"] = bool(d["enable_boleto"])
    return d

@router.post("/coupons/validate", response_model=CouponValidateResponse)
def validate_coupon(payload: CouponValidateRequest):
    code_clean = payload.code.strip().upper()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1", (code_clean,))
    coupon = cursor.fetchone()
    conn.close()

    if not coupon:
        return CouponValidateResponse(
            valid=False,
            code=payload.code,
            discount=0.0,
            message="Cupom inválido ou expirado"
        )

    coupon_dict = dict(coupon)
    min_order = coupon_dict["min_order_value"] or 0.0

    if payload.subtotal < min_order:
        return CouponValidateResponse(
            valid=False,
            code=code_clean,
            discount=0.0,
            message=f"Este cupom exige pedido mínimo de R$ {min_order:.2f}"
        )

    discount = 0.0
    if coupon_dict["discount_percent"]:
        discount = round(payload.subtotal * (coupon_dict["discount_percent"] / 100.0), 2)
    elif coupon_dict["fixed_discount"]:
        discount = min(payload.subtotal, coupon_dict["fixed_discount"])

    return CouponValidateResponse(
        valid=True,
        code=code_clean,
        discount=discount,
        message=f"Cupom aplicado com sucesso! Desconto de R$ {discount:.2f}"
    )

from fastapi import APIRouter
from database.connection import tx

router = APIRouter(tags=["configuracoes"])

@router.get("/settings")
def obter_configuracoes_loja(loja_id: int = 1):
    with tx() as conn:
        loja = conn.execute("SELECT * FROM loja WHERE id = ?", (loja_id,)).fetchone()
        if not loja:
            return {
                "id": 1,
                "store_name": "Papelaria & Bazar Central",
                "phone": "(14) 3413-0000",
                "address": "Rua São Luiz, 450 - Centro, Marília/SP",
                "reserva_minutos": 120,
                "aceita_entrega": 1
            }
        return {
            "id": loja["id"],
            "store_name": loja["nome"],
            "phone": loja["telefone"],
            "address": loja["endereco_retirada"],
            "cep": loja["cep_origem"],
            "reserva_minutos": loja["reserva_minutos"],
            "aceita_entrega": bool(loja["aceita_entrega"])
        }

@router.put("/settings")
def atualizar_configuracoes_loja(payload: dict, loja_id: int = 1):
    with tx() as conn:
        nome = payload.get("store_name")
        telefone = payload.get("phone")
        endereco = payload.get("address")
        reserva = payload.get("reserva_minutos", 120)
        
        conn.execute("""
            UPDATE loja 
            SET nome = COALESCE(?, nome),
                telefone = COALESCE(?, telefone),
                endereco_retirada = COALESCE(?, endereco_retirada),
                reserva_minutos = COALESCE(?, reserva_minutos)
            WHERE id = ?
        """, (nome, telefone, endereco, reserva, loja_id))
        
        return obter_configuracoes_loja(loja_id)

@router.get("/lojas")
def listar_lojas_disponiveis():
    """
    Demonstra critério de adaptabilidade a diferentes segmentos (Papelaria vs PetShop)
    """
    with tx() as conn:
        rows = conn.execute("SELECT id, nome, endereco_retirada, reserva_minutos FROM loja").fetchall()
        return [dict(r) for r in rows]

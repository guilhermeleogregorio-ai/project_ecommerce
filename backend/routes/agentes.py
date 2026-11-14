from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.agentes import orquestrar_agente

router = APIRouter(prefix="/agentes", tags=["agentes_ia"])

class OrquestracaoIn(BaseModel):
    loja_id: int = 1
    agente: str = "catalogo"  # 'catalogo' | 'vendas' | 'configuracao'
    solicitacao: str
    confirmacao_payload: dict | None = None

@router.post("/orquestrar")
def executar_orquestrador(data: OrquestracaoIn):
    """
    Endpoint principal dos Agentes de IA do Varejo Local:
    1. Agente de Catálogo: Cadastro guiado e consulta de estoque em linguagem natural.
    2. Agente de Vendas: Interpretação de pedidos por WhatsApp e pré-reserva com código.
    3. Autonomia e Confiança: O agente propõe, o lojista confirma.
    """
    try:
        resultado = orquestrar_agente(
            loja_id=data.loja_id,
            tipo_agente=data.agente,
            solicitacao=data.solicitacao,
            confirmacao_payload=data.confirmacao_payload
        )
        return {
            "status": "sucesso",
            "agente": data.agente,
            "resultado": resultado
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

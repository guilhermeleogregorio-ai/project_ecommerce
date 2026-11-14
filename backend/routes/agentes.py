from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.orchestrator import orchestrator
from agents.catalog_agent import CatalogAgentInstance
from agents.sales_agent import SalesAgentInstance
from agents.inventory_agent import InventoryAgentInstance

router = APIRouter(prefix="/agentes", tags=["agentes_ia"])

class OrquestracaoIn(BaseModel):
    loja_id: int = 1
    agente: str = "catalogo"  # 'catalogo' | 'vendas' | 'estoque'
    solicitacao: str
    confirmacao_payload: dict | None = None

class CriarInstanciaIn(BaseModel):
    agent_type: str  # 'catalogo' | 'vendas' | 'estoque'
    name: str

@router.post("/orquestrar")
def executar_orquestrador(data: OrquestracaoIn):
    """
    Endpoint do Orquestrador Central Multi-Instância:
    Despacha a tarefa para uma das instâncias autônomas ativas no pool com load balancing e telemetria.
    """
    try:
        response = orchestrator.dispatch(
            loja_id=data.loja_id,
            agent_type=data.agente,
            task=data.solicitacao,
            payload=data.confirmacao_payload
        )
        return {
            "status": "sucesso",
            "agente": data.agente,
            "orchestrator": response.get("orchestrator"),
            "dispatched_to": response.get("dispatched_to"),
            "resultado": response.get("resultado")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/cluster")
def obter_status_cluster():
    """
    Retorna o mapa de todas as instâncias ativas no cluster do Orquestrador:
    - ID da instância
    - Tipo e Nome
    - Status (idle, busy, error)
    - Total de requisições processadas
    - Latência de resposta (ms)
    """
    return orchestrator.get_cluster_status()

@router.post("/instancias")
def adicionar_instancia(data: CriarInstanciaIn):
    """
    Escala o cluster adicionando dinamicamente uma nova instância de agente worker.
    """
    import uuid
    uid = f"{data.agent_type}-worker-{uuid.uuid4().hex[:4]}"
    
    if data.agent_type == "catalogo":
        inst = CatalogAgentInstance(uid, name=data.name)
    elif data.agent_type == "vendas":
        inst = SalesAgentInstance(uid, name=data.name)
    else:
        inst = InventoryAgentInstance(uid, name=data.name)

    orchestrator.register_instance(inst)
    return {
        "status": "criado",
        "instance": inst.get_info(),
        "total_instances": len(orchestrator.instances)
    }

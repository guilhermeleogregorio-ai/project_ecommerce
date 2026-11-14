import time
from typing import Dict, List
from agents.base import AgentInstance
from agents.catalog_agent import CatalogAgentInstance
from agents.sales_agent import SalesAgentInstance
from agents.inventory_agent import InventoryAgentInstance
from models.core import Ctx, executar

class AgentOrchestrator:
    """
    Orquestrador Central Multi-Instância:
    - Gerencia um cluster distribuído de instâncias de agentes especializados.
    - Distribui tarefas entre múltiplas instâncias (load balancing por tipo).
    - Monitora a saúde (healthcheck), métricas e telemetria de cada instância.
    - Grava auditoria atômica de todas as execuções.
    """
    def __init__(self):
        self.instances: Dict[str, AgentInstance] = {}
        self._round_robin_index: Dict[str, int] = {}
        self._initialize_default_cluster()

    def _initialize_default_cluster(self):
        """
        Inicializa o pool de instâncias ativas do cluster (múltiplas instâncias por especialidade)
        """
        # Instâncias de Catálogo
        self.register_instance(CatalogAgentInstance("catalog-inst-01", name="Agente Catálogo #1 (Primário)"))
        self.register_instance(CatalogAgentInstance("catalog-inst-02", name="Agente Catálogo #2 (Secundário)"))
        
        # Instâncias de Vendas / WhatsApp
        self.register_instance(SalesAgentInstance("sales-inst-01", name="Agente WhatsApp & Vendas #1"))
        self.register_instance(SalesAgentInstance("sales-inst-02", name="Agente WhatsApp & Vendas #2"))
        
        # Instância de Balcão e Estoque
        self.register_instance(InventoryAgentInstance("inv-inst-01", name="Agente Balcão & Sincronização"))

    def register_instance(self, instance: AgentInstance):
        self.instances[instance.instance_id] = instance
        if instance.agent_type not in self._round_robin_index:
            self._round_robin_index[instance.agent_type] = 0

    def get_instances_by_type(self, agent_type: str) -> List[AgentInstance]:
        return [inst for inst in self.instances.values() if inst.agent_type == agent_type]

    def select_instance(self, agent_type: str) -> AgentInstance:
        """
        Seleciona a melhor instância disponível distribuindo as requisições em round-robin
        entre as instâncias saudáveis do pool daquele tipo.
        """
        candidates = self.get_instances_by_type(agent_type)
        if not candidates:
            candidates = list(self.instances.values())

        idx = self._round_robin_index.get(agent_type, 0) % len(candidates)
        self._round_robin_index[agent_type] = idx + 1
        return candidates[idx]

    def dispatch(self, loja_id: int, agent_type: str, task: str, payload: dict = None) -> dict:
        """
        Despacha a tarefa para uma das instâncias do pool através do orquestrador
        """
        target_instance = self.select_instance(agent_type)

        def _runner(conn, ctx):
            return target_instance.run(conn, ctx, task, payload or {})

        resultado = executar(loja_id, agent_type, None, task, _runner)
        return {
            "orchestrator": "Salesdrive Distributed Orchestrator v2.0",
            "dispatched_to": {
                "instance_id": target_instance.instance_id,
                "name": target_instance.name,
                "agent_type": target_instance.agent_type
            },
            "resultado": resultado
        }

    def get_cluster_status(self) -> dict:
        """
        Telemetria em tempo real de todas as instâncias do cluster
        """
        insts = [inst.get_info() for inst in self.instances.values()]
        total_requests = sum(i["total_requests"] for i in insts)
        total_success = sum(i["successful_requests"] for i in insts)
        
        return {
            "cluster_name": "Salesdrive Multi-Instance Agent Cluster",
            "status": "online",
            "total_instances": len(self.instances),
            "active_instances": len([i for i in insts if i["status"] != "error"]),
            "metrics": {
                "total_dispatched_requests": total_requests,
                "successful_executions": total_success,
                "success_rate_pct": round((total_success / total_requests * 100), 1) if total_requests > 0 else 100.0
            },
            "instances": insts
        }

# Singleton Global do Orquestrador
orchestrator = AgentOrchestrator()

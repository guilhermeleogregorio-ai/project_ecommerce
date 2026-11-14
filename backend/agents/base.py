from abc import ABC, abstractmethod
import time
import uuid

class AgentInstance(ABC):
    """
    Instância autônoma de um Agente de IA especializado.
    Cada instância possui ciclo de vida próprio, métricas de execução e isolamento de estado.
    """
    def __init__(self, instance_id: str, agent_type: str, name: str):
        self.instance_id = instance_id
        self.agent_type = agent_type
        self.name = name
        self.status = "idle"  # 'idle' | 'busy' | 'error'
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.last_execution_time_ms = 0.0
        self.started_at = time.time()

    def get_info(self) -> dict:
        return {
            "instance_id": self.instance_id,
            "agent_type": self.agent_type,
            "name": self.name,
            "status": self.status,
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "last_execution_time_ms": round(self.last_execution_time_ms, 2),
            "uptime_seconds": int(time.time() - self.started_at)
        }

    def run(self, conn, ctx, task: str, payload: dict = None) -> dict:
        self.status = "busy"
        self.total_requests += 1
        t0 = time.perf_counter()
        try:
            result = self.execute(conn, ctx, task, payload or {})
            self.successful_requests += 1
            self.status = "idle"
            return result
        except Exception as e:
            self.failed_requests += 1
            self.status = "error"
            raise e
        finally:
            self.last_execution_time_ms = (time.perf_counter() - t0) * 1000.0

    @abstractmethod
    def execute(self, conn, ctx, task: str, payload: dict) -> dict:
        pass

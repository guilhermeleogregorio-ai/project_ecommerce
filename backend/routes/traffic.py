from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

try:
    from backend.database.connection import connect, tx
except ImportError:
    from database.connection import connect, tx

router = APIRouter(prefix="/traffic", tags=["Tráfego Pago Google"])

PLANS = [
    {
        "id": "google-local-start",
        "name": "Google Local Start",
        "badge": "RECOMENDADO",
        "highlight": True,
        "tagline": "Até 15.000 pessoas do seu bairro impactadas",
        "monthly_price": 24.99,
        "promo_price": 6.50,
        "promo_months": 3,
        "annual_price": 5.33,
        "annual_total": 63.96,
        "daily_budget_ref": 10.0,
        "features": [
            "Destaque no topo do Google Maps com botão 'Como Chegar'",
            "Anúncios na Busca do Google para termos locais ('mercado perto de mim')",
            "Perfil da Empresa no Google otimizado automaticamente com IA",
            "Relatório semanal de visitas e ligações direto no WhatsApp",
            "Configuração 100% automática sem necessidade de agência"
        ],
        "google_service": "Google Maps & Busca Local",
        "cta": "Tenha o Google Local Start"
    },
    {
        "id": "google-varejo-pro",
        "name": "Google Varejo Pro",
        "badge": "MAIS POPULAR",
        "highlight": False,
        "tagline": "Catálogo completo no Google Shopping com IA",
        "monthly_price": 96.99,
        "promo_price": 23.99,
        "promo_months": 3,
        "annual_price": 19.67,
        "annual_total": 236.04,
        "daily_budget_ref": 25.0,
        "features": [
            "Seus produtos com foto e preço no Google Shopping",
            "Campanhas inteligentes com Gemini IA para as palavras mais buscadas",
            "Link direto do anúncio para o WhatsApp ou carrinho da sua loja",
            "Rastreamento de conversões de vendas físicas e online",
            "Bônus de R$ 150 em créditos de anúncios do Google na ativação",
            "Suporte prioritário via WhatsApp com especialista de tráfego"
        ],
        "google_service": "Google Shopping & Gemini Ads",
        "cta": "Tenha o Google Varejo Pro"
    },
    {
        "id": "google-dominancia-ultra",
        "name": "Google Dominância Ultra",
        "badge": "EXPANSÃO RÁPIDA",
        "highlight": False,
        "tagline": "Para quem quer dominar as vendas na cidade",
        "monthly_price": 779.90,
        "promo_price": None,
        "promo_months": None,
        "annual_price": 639.50,
        "annual_total": 7674.00,
        "daily_budget_ref": 75.0,
        "features": [
            "Campanhas multicanais: Busca, Maps, YouTube e Rede de Display",
            "Consultor Google Partner dedicado com alinhamento quinzenal",
            "Otimização diária de palavras-chave negativas para não desperdiçar verba",
            "Integração direta com o estoque do seu ERP/Salesdrive",
            "Gestão completa da verba e relatórios executivos de ROI",
            "Garantia de posicionamento líder na sua cidade"
        ],
        "google_service": "Google Ads 360 & YouTube",
        "cta": "Tenha o Google Dominância Ultra"
    }
]

class CreateCampaignRequest(BaseModel):
    plan_id: str
    plan_name: str
    radius_km: int = Field(5, ge=1, le=50)
    objective: str = Field("LOCAL_VISITS", description="LOCAL_VISITS, WHATSAPP_ORDERS, STORE_CATALOG")
    billing_cycle: str = Field("MONTHLY", description="MONTHLY or ANNUAL")
    price: float
    payment_method: str = Field("PIX", description="PIX or CREDIT_CARD")
    daily_budget: float = Field(15.0, ge=5.0)

class SimulateRequest(BaseModel):
    daily_budget: float = Field(15.0, ge=5.0, le=500.0)
    radius_km: int = Field(5, ge=1, le=50)

@router.get("/plans")
def get_plans():
    return PLANS

@router.get("/campaigns")
def get_campaigns():
    with connect() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM traffic_campaigns ORDER BY id DESC")
        rows = cursor.fetchall()
        
        # Se ainda não houver campanhas cadastradas, cria uma prévia realista
        if not rows:
            cursor.execute("""
            INSERT INTO traffic_campaigns 
            (plan_id, plan_name, radius_km, objective, billing_cycle, price, payment_method, status, daily_budget, impressions, clicks)
            VALUES 
            ('google-local-start', 'Google Local Start', 5, 'LOCAL_VISITS', 'MONTHLY', 6.50, 'PIX', 'ACTIVE', 10.0, 18450, 742)
            """)
            conn.commit()
            cursor.execute("SELECT * FROM traffic_campaigns ORDER BY id DESC")
            rows = cursor.fetchall()
            
        return [dict(r) for r in rows]

@router.post("/campaigns")
def create_campaign(payload: CreateCampaignRequest):
    with tx() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO traffic_campaigns (
            plan_id, plan_name, radius_km, objective, billing_cycle, price, payment_method, status, daily_budget, impressions, clicks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, 120, 8)
        """, (
            payload.plan_id,
            payload.plan_name,
            payload.radius_km,
            payload.objective,
            payload.billing_cycle,
            payload.price,
            payload.payment_method,
            payload.daily_budget
        ))
        camp_id = cursor.lastrowid
        cursor.execute("SELECT * FROM traffic_campaigns WHERE id = ?", (camp_id,))
        created = dict(cursor.fetchone())
        return created

@router.patch("/campaigns/{campaign_id}/status")
def toggle_campaign_status(campaign_id: int):
    with tx() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT status FROM traffic_campaigns WHERE id = ?", (campaign_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Campanha não encontrada")
        
        current_status = row["status"]
        new_status = "PAUSED" if current_status == "ACTIVE" else "ACTIVE"
        
        cursor.execute("UPDATE traffic_campaigns SET status = ? WHERE id = ?", (new_status, campaign_id))
        cursor.execute("SELECT * FROM traffic_campaigns WHERE id = ?", (campaign_id,))
        return dict(cursor.fetchone())

@router.post("/simulate")
def simulate_traffic(req: SimulateRequest):
    # Cálculo didático e simplificado de retorno estimado
    daily = req.daily_budget
    monthly_investment = daily * 30
    
    # Estimativa de impressões: ~1.200 impressões locais por cada R$ 10 investidos
    monthly_impressions = int((monthly_investment / 10.0) * 1200)
    # Estimativa de cliques/visitas qualificadas: ~4% CTR local
    monthly_clicks = int(monthly_impressions * 0.042)
    # Estimativa de conversões em vendas no balcão/WhatsApp: ~8% dos cliques viram compra
    estimated_sales_count = int(monthly_clicks * 0.08)
    # Ticket médio típico de varejo: R$ 45,00
    estimated_revenue_min = round(estimated_sales_count * 38.0, 2)
    estimated_revenue_max = round(estimated_sales_count * 65.0, 2)
    
    return {
        "daily_budget": daily,
        "monthly_investment": monthly_investment,
        "estimated_monthly_reach": monthly_impressions,
        "estimated_store_visits": monthly_clicks,
        "estimated_orders": estimated_sales_count,
        "estimated_revenue_range": {
            "min": estimated_revenue_min,
            "max": estimated_revenue_max
        },
        "roi_estimated_multiplier": f"{round(estimated_revenue_min / max(1, monthly_investment), 1)}x a {round(estimated_revenue_max / max(1, monthly_investment), 1)}x"
    }

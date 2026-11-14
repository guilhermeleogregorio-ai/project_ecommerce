import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  ShoppingBag, 
  TrendingUp, 
  Check, 
  X, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Smartphone, 
  Eye, 
  Users, 
  Sliders, 
  ChevronRight,
  ExternalLink,
  Award,
  Play,
  Pause,
  Clock,
  Layers
} from 'lucide-react';
import { api } from '../../../services/api';

export default function GoogleTrafficPage() {
  const navigate = useNavigate();

  // Estado do Seletor Mensal / Anual
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' | 'ANNUAL'
  const [plans, setPlans] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulador Interativo de ROI
  const [dailyBudget, setDailyBudget] = useState(15);
  const [radiusKm, setRadiusKm] = useState(5);
  const [simulation, setSimulation] = useState({
    estimated_monthly_reach: 18000,
    estimated_store_visits: 756,
    estimated_orders: 60,
    estimated_revenue_range: { min: 2280, max: 3900 },
    roi_estimated_multiplier: '5.1x a 8.7x'
  });

  // Modal de Contratação do Plano
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [objective, setObjective] = useState('LOCAL_VISITS');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [plansData, campsData] = await Promise.all([
          api.getTrafficPlans(),
          api.getTrafficCampaigns()
        ]);
        setPlans(plansData);
        setCampaigns(campsData);
      } catch (err) {
        console.error('Erro ao carregar dados de tráfego:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Atualiza simulação quando o orçamento ou raio mudam
  useEffect(() => {
    async function updateSim() {
      try {
        const res = await api.simulateTraffic({ daily_budget: Number(dailyBudget), radius_km: Number(radiusKm) });
        setSimulation(res);
      } catch (err) {
        console.error('Erro na simulação:', err);
      }
    }
    updateSim();
  }, [dailyBudget, radiusKm]);

  const handleOpenSubscribe = (plan) => {
    setSelectedPlan(plan);
    setSuccessMsg(false);
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const price = billingCycle === 'ANNUAL' ? selectedPlan.annual_total : (selectedPlan.promo_price || selectedPlan.monthly_price);
      await api.createTrafficCampaign({
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        radius_km: Number(radiusKm),
        objective: objective,
        billing_cycle: billingCycle,
        price: price,
        payment_method: paymentMethod,
        daily_budget: selectedPlan.daily_budget_ref || 15.0
      });
      setSuccessMsg(true);
      // Recarrega campanhas
      const updatedCamps = await api.getTrafficCampaigns();
      setCampaigns(updatedCamps);
      setTimeout(() => {
        setSelectedPlan(null);
        setSuccessMsg(false);
      }, 2500);
    } catch (err) {
      alert(`Falha ao ativar campanha: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleTrafficCampaignStatus(id);
      const updatedCamps = await api.getTrafficCampaigns();
      setCampaigns(updatedCamps);
    } catch (err) {
      alert('Erro ao atualizar status da campanha');
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-slate-100 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-12 py-10 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header Bar Estilo Google One / Gemini */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Logo Google estilizado */}
          <div className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
            <span className="text-blue-400 font-extrabold text-2xl">G</span>
            <span className="text-red-400 font-extrabold text-2xl">o</span>
            <span className="text-yellow-400 font-extrabold text-2xl">o</span>
            <span className="text-blue-400 font-extrabold text-2xl">g</span>
            <span className="text-green-400 font-extrabold text-2xl">l</span>
            <span className="text-red-400 font-extrabold text-2xl">e</span>
            <span className="text-white ml-2 text-lg font-semibold tracking-normal">Ads + Salesdrive</span>
          </div>
          <span className="hidden sm:inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
            Parceiro Oficial PME
          </span>
        </div>

        <Link
          to="/store/catalog"
          className="text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full transition-all border border-white/10"
        >
          <span>Voltar à Loja</span>
          <X className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Banner de Expansão de Negócios (idêntico ao print do Gemini) */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="bg-[#1e1f20] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-300 text-center sm:text-left">
            <div className="flex items-center gap-1.5 text-base flex-shrink-0">
              <span>📍</span>
              <span>🔍</span>
              <span>🛒</span>
              <span>✨</span>
            </div>
            <p>
              <strong className="text-white font-semibold">Quer atrair clientes do seu bairro?</strong> Anuncie de forma 100% automática na Busca do Google, Google Maps e Shopping sem precisar de agência.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="#como-funciona" className="text-slate-400 hover:text-white font-medium">Como funciona?</a>
            <a href="#planos" className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-1.5 rounded-full transition-colors">
              Ver planos
            </a>
          </div>
        </div>
      </div>

      {/* Bloco Central de Título & Subtítulo (Estilo Google Gemini) */}
      <div className="max-w-4xl mx-auto text-center mt-12 sm:mt-16 space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Faça upgrade para ter mais vendas com o{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Google
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Cancele quando quiser. Ao assinar, seus produtos e seu comércio passam a aparecer para quem pesquisa na sua região. Simples, previsível e sem complicação.
        </p>
      </div>

      {/* Seletor Pill: Mensal vs Anual (Economize 18%) */}
      <div className="flex justify-center mt-8" id="planos">
        <div className="bg-[#1e1f20] p-1 rounded-full border border-white/10 flex items-center shadow-lg">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              billingCycle === 'ANNUAL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Anual</span>
            <span className="text-emerald-400 font-black text-xs">Economize 18%</span>
          </button>
        </div>
      </div>

      {/* Grid de 3 Cards de Planos (Estilo Google AI Plus / Pro / Ultra) */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isRecommended = plan.highlight || plan.id === 'google-local-start';
          const isAnnual = billingCycle === 'ANNUAL';

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                isRecommended
                  ? 'bg-[#18191b] border-2 border-blue-500 shadow-2xl shadow-blue-500/10'
                  : 'bg-[#18191b] border border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-5">
                {/* Badge do Card */}
                {plan.badge && (
                  <div>
                    <span
                      className={`text-[11px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md ${
                        isRecommended
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Nome do Plano */}
                <div>
                  <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                    <span className="w-4 h-4 text-blue-400">☁️</span>
                    <span className="font-medium">{plan.tagline}</span>
                  </div>
                </div>

                {/* Preços */}
                <div className="pt-2 border-t border-white/10">
                  {isAnnual ? (
                    <div>
                      <p className="text-xs text-slate-400">Faturado anualmente por R$ {plan.annual_total.toFixed(2)}/ano</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-black text-emerald-400">
                          R$ {plan.annual_price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">/mês</span>
                      </div>
                    </div>
                  ) : plan.promo_price ? (
                    <div>
                      <span className="text-xs text-slate-500 line-through">
                        R$ {plan.monthly_price.toFixed(2).replace('.', ',')}
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-black text-emerald-400">
                          R$ {plan.promo_price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">/mês</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        por {plan.promo_months} meses, depois R$ {plan.monthly_price.toFixed(2).replace('.', ',')}/mês
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-400">A partir de</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-black text-white">
                          R$ {plan.monthly_price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">/mês</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de Vantagens */}
                <div className="space-y-2.5 pt-4 text-xs text-slate-300">
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-400">O que está incluído:</p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão de Ação / CTA idêntico ao do Google Gemini */}
              <div className="pt-8">
                <button
                  onClick={() => handleOpenSubscribe(plan)}
                  className={`w-full py-3 px-5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] ${
                    isRecommended
                      ? 'bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#041e49]'
                      : 'bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#041e49]'
                  }`}
                >
                  {plan.cta || `Tenha o ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campanhas Ativas do Varejista (Se houver) */}
      {campaigns.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16 bg-[#18191b] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h2 className="text-lg font-black text-white">Seus Anúncios no Google em Andamento</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Painel simplificado com pessoas alcançadas no seu bairro e cliques gerados.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Otimizado por IA 24h
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-[#212327] rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm">{camp.plan_name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Raio: {camp.radius_km} km em torno da sua loja</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    camp.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {camp.status === 'ACTIVE' ? 'Veiculando' : 'Pausada'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-[10px] block">Pessoas que viram</span>
                    <span className="text-base font-black text-white mt-0.5 block">{camp.impressions.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-[10px] block">Cliques / Visitas</span>
                    <span className="text-base font-black text-blue-400 mt-0.5 block">{camp.clicks.toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                  <span className="text-slate-400">Verba: <strong>R$ {camp.daily_budget.toFixed(2)}/dia</strong></span>
                  <button
                    onClick={() => handleToggleStatus(camp.id)}
                    className="text-xs text-slate-300 hover:text-white font-bold underline"
                  >
                    {camp.status === 'ACTIVE' ? 'Pausar' : 'Reativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção Didática: "Como o Tráfego Pago Funciona na Prática" */}
      <div className="max-w-6xl mx-auto mt-20 space-y-8" id="como-funciona">
        <div className="text-center space-y-2">
          <span className="text-blue-400 font-extrabold text-xs tracking-wider uppercase">
            Passo a Passo Simples
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Como seu investimento vira clientes no seu balcão
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Você não precisa entender de marketing, palavras-chave ou métricas difíceis. Veja o ciclo em 3 etapas:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#18191b] rounded-3xl p-6 border border-white/10 space-y-4 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl font-bold border border-blue-500/20">
              1
            </div>
            <h3 className="font-bold text-white text-base">O vizinho pesquisa no Google</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Alguém a 2 km ou 5 km da sua loja pesquisa no celular: <em>"arroz em promoção perto de mim"</em> ou <em>"distribuidora de bebidas aberta"</em>.
            </p>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-[11px] text-slate-300 font-mono">
              🔍 "mercado perto de mim"
            </div>
          </div>

          <div className="bg-[#18191b] rounded-3xl p-6 border border-white/10 space-y-4 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl font-bold border border-indigo-500/20">
              2
            </div>
            <h3 className="font-bold text-white text-base">O Google mostra sua loja no topo</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              O Google posiciona o seu comércio em destaque no Google Maps e no topo das buscas, com foto do produto, preço e botão "Como Chegar".
            </p>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-[11px] text-emerald-400 flex items-center gap-1.5">
              <span>📍 Sua Loja • Aberto agora (500m)</span>
            </div>
          </div>

          <div className="bg-[#18191b] rounded-3xl p-6 border border-white/10 space-y-4 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/20">
              3
            </div>
            <h3 className="font-bold text-white text-base">O cliente compra de você</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              O comprador vai até a sua loja física ou clica no botão para pedir pelo seu WhatsApp ou loja virtual da Salesdrive.
            </p>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-[11px] text-white flex items-center justify-between">
              <span>💰 Venda Realizada</span>
              <span className="text-emerald-400 font-bold">+R$ 85,00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulador Interativo de Orçamento & Retorno (ROI) */}
      <div className="max-w-6xl mx-auto mt-20 bg-gradient-to-br from-[#18191b] via-[#1e1f20] to-[#18191b] rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulador Interativo</span>
            </div>
            <h2 className="text-2xl font-black text-white">Quanto você quer investir por dia no Google?</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Arraste o valor abaixo para ver quantas pessoas do seu bairro serão impactadas no mês.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-right">
            <span className="text-[11px] text-slate-400 block">Investimento Mensal Total</span>
            <span className="text-2xl font-black text-white">
              R$ {(dailyBudget * 30).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Sliders de Controle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Investimento Diário:</span>
              <span className="text-base text-blue-400 font-black">R$ {dailyBudget},00/dia</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>R$ 10/dia (Iniciante)</span>
              <span>R$ 50/dia (Forte)</span>
              <span>R$ 100/dia (Líder)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span>Raio de Alcance ao Redor da sua Loja:</span>
              <span className="text-base text-indigo-400 font-black">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>2 km (Bairro)</span>
              <span>10 km (Região)</span>
              <span>20 km (Cidade toda)</span>
            </div>
          </div>
        </div>

        {/* Resultados da Simulação em Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Vizinhos Impactados
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {simulation.estimated_monthly_reach?.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] text-slate-500 block">pessoas por mês</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              Visitas ou Ligações
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-300">
              ~{simulation.estimated_store_visits?.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] text-slate-500 block">cliques qualificados</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              Pedidos Estimados
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-300">
              ~{simulation.estimated_orders}
            </span>
            <span className="text-[10px] text-slate-500 block">compras concluídas</span>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Retorno Estimado em Vendas
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              R$ {simulation.estimated_revenue_range?.min?.toLocaleString('pt-BR')} a R$ {simulation.estimated_revenue_range?.max?.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] text-emerald-500/80 block font-bold">
              Retorno estimado de {simulation.roi_estimated_multiplier}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Contratação / Ativação Imediata */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#1e1f20] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 text-slate-100">
            {successMsg ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">Campanha Google Ativada!</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Os robôs do Google já estão configurando sua presença no Maps e nas buscas. Seus anúncios começarão a rodar em minutos.
                </p>
                <div className="p-3 bg-black/40 rounded-xl text-xs text-emerald-400 font-mono">
                  Status: 🟢 VEICULANDO NO GOOGLE MAPS
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Ativação Rápida</span>
                    <h2 className="text-xl font-black text-white">{selectedPlan.name}</h2>
                  </div>
                  <button onClick={() => setSelectedPlan(null)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Resumo do Plano */}
                  <div className="p-4 bg-black/30 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white text-sm">{selectedPlan.name}</p>
                      <p className="text-slate-400 text-[11px]">{selectedPlan.google_service}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-400">
                        R$ {(billingCycle === 'ANNUAL' ? selectedPlan.annual_total : (selectedPlan.promo_price || selectedPlan.monthly_price)).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{billingCycle === 'ANNUAL' ? 'ao ano' : 'no 1º mês'}</span>
                    </div>
                  </div>

                  {/* Objetivo da Campanha */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">Qual seu objetivo principal?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setObjective('LOCAL_VISITS')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          objective === 'LOCAL_VISITS'
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                            : 'bg-black/20 border-white/10 text-slate-400'
                        }`}
                      >
                        <MapPin className="w-4 h-4 mb-1 text-blue-400" />
                        <span>Mais clientes na loja física</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setObjective('WHATSAPP_ORDERS')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          objective === 'WHATSAPP_ORDERS'
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                            : 'bg-black/20 border-white/10 text-slate-400'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 mb-1 text-emerald-400" />
                        <span>Mais pedidos no WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Forma de Pagamento */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">Forma de pagamento da assinatura:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PIX')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          paymentMethod === 'PIX'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                            : 'bg-black/20 border-white/10 text-slate-400'
                        }`}
                      >
                        <span>PIX Instantâneo</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Ativa na hora</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CREDIT_CARD')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === 'CREDIT_CARD'
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                            : 'bg-black/20 border-white/10 text-slate-400'
                        }`}
                      >
                        <span>Cartão de Crédito</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer do Modal */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="text-xs text-slate-400 hover:text-white font-bold"
                  >
                    Voltar
                  </button>

                  <button
                    onClick={handleConfirmSubscribe}
                    disabled={submitting}
                    className="px-6 py-3 rounded-full bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#041e49] font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
                  >
                    {submitting ? 'Ativando no Google...' : 'Confirmar e Ativar Anúncios'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

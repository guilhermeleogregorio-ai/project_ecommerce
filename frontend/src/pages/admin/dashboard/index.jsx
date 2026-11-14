import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Award, 
  Clock, 
  Package, 
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Store
} from 'lucide-react';
import { api } from '../../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await api.getDashboardMetrics();
        setData(res);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-xs mt-3">Carregando indicadores do Salesdrive...</p>
      </div>
    );
  }

  const { kpis, status_counts, top_products, top_sellers, low_stock_alerts, recent_orders, sales_timeline } = data || {};

  return (
    <div className="space-y-8 pb-16">
      {/* Header com Boas-Vindas & Status Operacional */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Operação Comercial Ativa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Painel Executivo Salesdrive
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Monitoramento em tempo real de faturamento, canais digitais e força de vendas.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/store/catalog"
            className="px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl border border-brand-200 transition-all flex items-center gap-1.5"
          >
            <Store className="w-4 h-4" />
            <span>Ver Loja Virtual</span>
          </Link>
          <Link
            to="/commercial/orders"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>Ver Todos os Pedidos</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 Cards de KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Faturado */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento Total</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            R$ {kpis?.total_sales?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% em relação ao mês anterior</span>
          </p>
        </div>

        {/* KPI 2: Total de Pedidos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pedidos Emitidos</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {kpis?.total_orders} pedidos
          </h3>
          <p className="text-[11px] text-slate-500">
            {status_counts?.SEPARATION || 0} em separação de estoque
          </p>
        </div>

        {/* KPI 3: Ticket Médio */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Médio B2B</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            R$ {kpis?.average_ticket?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-500">Média por pedido de atacado</p>
        </div>

        {/* KPI 4: Varejistas Ativos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Varejistas Cadastrados</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {kpis?.total_customers} clientes
          </h3>
          <p className="text-[11px] text-slate-500">Supermercados, empórios e padarias</p>
        </div>
      </div>

      {/* Gráfico Visual de Evolução de Vendas Diárias */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900">Evolução Diária de Vendas (Últimos 7 Dias)</h2>
            <p className="text-xs text-slate-500">Curva de pedidos e faturamento gerados pela força de vendas e portal.</p>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
            Novembro/2026
          </span>
        </div>

        {/* Gráfico Customizado em CSS */}
        <div className="pt-4">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 border-b border-slate-100">
            {sales_timeline?.map((item, idx) => {
              const maxVal = 4000;
              const heightPercent = Math.min(100, (item.total / maxVal) * 100);

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    R$ {item.total.toFixed(0)}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 group-hover:bg-brand-100 rounded-t-xl overflow-hidden h-full flex items-end transition-all">
                    <div
                      className="w-full bg-brand-600 group-hover:bg-brand-500 rounded-t-xl transition-all duration-500 shadow-sm"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 mt-1">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seção com 2 Colunas: Top Produtos & Alertas de Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Produtos Mais Vendidos */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">Campeões de Vendas (Top 5)</h2>
            <Link to="/admin/products" className="text-xs text-brand-600 font-bold hover:underline">
              Gerenciar Produtos
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {top_products?.map((prod, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{prod.product_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {prod.product_sku}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-slate-900">R$ {prod.total_revenue.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500">{prod.total_quantity} unidades vendidas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de Reposição de Estoque */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Giro Crítico de Estoque</span>
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {low_stock_alerts?.map((item) => (
              <div key={item.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[10px] text-slate-500">Mínimo: {item.min_quantity} {item.unit}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {item.stock} {item.unit} restantes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Força de Vendas e Desempenho de Metas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900">Desempenho da Força de Vendas</h2>
            <p className="text-xs text-slate-500">Acompanhamento dos representantes comerciais cadastrados no Salesdrive.</p>
          </div>
          <Link to="/commercial/sellers" className="text-xs text-brand-600 font-bold hover:underline">
            Ver Equipe
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top_sellers?.map((seller) => {
            const percent = Math.min(100, (seller.current_sales / seller.monthly_goal) * 100);
            return (
              <div key={seller.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{seller.name}</p>
                    <p className="text-[11px] text-slate-500">{seller.code} • {seller.region}</p>
                  </div>
                  <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-[10px]">
                    {percent.toFixed(0)}% da Meta
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Vendido: <strong>R$ {seller.current_sales.toLocaleString('pt-BR')}</strong></span>
                  <span>Meta: R$ {seller.monthly_goal.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

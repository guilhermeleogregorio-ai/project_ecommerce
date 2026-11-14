import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  ShoppingBag, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { api } from '../../../services/api';

export default function BalcaoOperacao() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Entrega por código de retirada
  const [codigoRetiradaInput, setCodigoRetiradaInput] = useState('');
  const [mensagemRetirada, setMensagemRetirada] = useState(null);
  
  // Venda rápida presencial de balcão
  const [selectedProductId, setSelectedProductId] = useState('');
  const [vendaQtd, setVendaQtd] = useState(1);
  const [vendaMensagem, setVendaMensagem] = useState(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [ords, prods] = await Promise.all([
        api.getOrders(),
        api.getProducts()
      ]);
      setOrders(ords);
      setProducts(prods);
    } catch (err) {
      console.error('Erro ao carregar dados do balcão:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleEntregarRetirada = async (e) => {
    e.preventDefault();
    if (!codigoRetiradaInput) return;
    try {
      const res = await api.concluirRetiradaBalcao(codigoRetiradaInput.trim());
      setMensagemRetirada({
        tipo: 'sucesso',
        texto: `Retirada confirmada com sucesso! Pedido #${res.id} entregue ao cliente e estoque baixado.`
      });
      setCodigoRetiradaInput('');
      carregarDados();
    } catch (err) {
      setMensagemRetirada({
        tipo: 'erro',
        texto: err.message || 'Código de retirada não encontrado ou já retirado.'
      });
    }
  };

  const handleVendaBalcao = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      await api.registrarVendaBalcao([
        { product_id: parseInt(selectedProductId), quantity: parseInt(vendaQtd) }
      ]);
      setVendaMensagem({
        tipo: 'sucesso',
        texto: 'Venda presencial registrada! Estoque físico baixado imediatamente.'
      });
      setSelectedProductId('');
      setVendaQtd(1);
      carregarDados();
    } catch (err) {
      setVendaMensagem({
        tipo: 'erro',
        texto: err.message || 'Falha ao registrar venda presencial.'
      });
    }
  };

  const handleMarcarSeparado = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, { status: 'separado' });
      carregarDados();
    } catch (err) {
      alert('Erro ao separar pedido: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header do Balcão */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Rotina da Loja Física (Salesdrive Loja Central)
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Balcão de Atendimento & Retiradas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controle integrado entre a venda presencial e os pedidos retirados na loja.
          </p>
        </div>
        <button
          onClick={carregarDados}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Atualizar Estoque</span>
        </button>
      </div>

      {/* Grid: 1. Concluir Retirada | 2. Venda Presencial no Balcão */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Baixar Retirada por Código */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm">
            <PackageCheck className="w-5 h-5 text-brand-600" />
            <span>Entregar Pedido Retirado no Balcão</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quando o cliente chegar à loja e disser o código de 6 dígitos gerado na compra digital.
          </p>

          <form onSubmit={handleEntregarRetirada} className="mt-4 flex gap-3">
            <input
              type="text"
              placeholder="Ex: RET-101 ou 6 dígitos"
              value={codigoRetiradaInput}
              onChange={(e) => setCodigoRetiradaInput(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Confirmar Retirada
            </button>
          </form>

          {mensagemRetirada && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-medium ${
              mensagemRetirada.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {mensagemRetirada.texto}
            </div>
          )}
        </div>

        {/* Card 2: Venda Presencial Direta */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-sm">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <span>Venda Rápida Presencial (Balcão Físico)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cliente no balcão: baixa estoque imediatamente e não permite vender item reservado online.
          </p>

          <form onSubmit={handleVendaBalcao} className="mt-4 flex flex-col sm:flex-row gap-3">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione o produto do balcão...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.saldo_livre <= 0}>
                  {p.name} — Livre: {p.saldo_livre} un (Total: {p.stock})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              max="99"
              value={vendaQtd}
              onChange={(e) => setVendaQtd(e.target.value)}
              className="w-20 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-center outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Baixar Venda
            </button>
          </form>

          {vendaMensagem && (
            <div className={`mt-3 p-3 rounded-xl text-xs font-medium ${
              vendaMensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {vendaMensagem.texto}
            </div>
          )}
        </div>
      </div>

      {/* Fila de Pedidos para Retirada na Loja */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Pedidos Digitais Aguardando Retirada ou Separação
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Itens já pagos ou reservados digitalmente para retirada na loja física.
            </p>
          </div>
          <span className="text-xs bg-brand-50 text-brand-700 font-bold px-3 py-1 rounded-full border border-brand-200">
            {orders.filter(o => ['pago', 'separado', 'aguardando_pagamento'].includes(o.status)).length} ativos
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {orders.map((ord) => (
            <div key={ord.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{ord.order_number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    ord.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' :
                    ord.status === 'separado' ? 'bg-indigo-100 text-indigo-800' :
                    ord.status === 'pago' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.status}
                  </span>
                  {ord.codigo_retirada && (
                    <span className="bg-slate-900 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
                      Código: {ord.codigo_retirada}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  <span className="font-medium text-slate-900">{ord.customer_name}</span> • Total: R$ {ord.total.toFixed(2)}
                </p>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                  {ord.items?.map((it, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded">
                      {it.quantity}x {it.product_name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {ord.status === 'pago' && (
                  <button
                    onClick={() => handleMarcarSeparado(ord.id)}
                    className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition"
                  >
                    Marcar como Separado na Caixa
                  </button>
                )}
                {ord.status === 'separado' && (
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Pronto na caixa de retirada
                  </span>
                )}
                {ord.status === 'concluido' && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Retirado pelo cliente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

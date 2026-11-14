import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  Truck, 
  XCircle, 
  Eye, 
  X, 
  Printer, 
  ChevronDown,
  Building2,
  Calendar,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { api } from '../../../services/api';

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  APPROVED: { label: 'Aprovado', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  SEPARATION: { label: 'Em Separação', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: ShoppingBag },
  BILLED: { label: 'Faturado', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: PackageCheck },
  DELIVERED: { label: 'Entregue', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Truck },
  CANCELLED: { label: 'Cancelado', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
};

export default function CommercialOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders({
        status: statusFilter,
        search: search.trim()
      });
      setOrders(data);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const updated = await api.updateOrderStatus(orderId, { status: newStatus });
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert(`Erro ao atualizar status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header do Módulo Comercial */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-600" />
            <span>Gestão Operacional de Pedidos</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Acompanhe a emissão, faturamento e logística de entrega para o varejo.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Buscar pedido, cliente ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Abas de Filtros de Status */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'PENDING', 'SEPARATION', 'BILLED', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
              statusFilter === st
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'Todos os Pedidos' : STATUS_CONFIG[st]?.label || st}
          </button>
        ))}
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Carregando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Nenhum pedido encontrado</p>
            <p className="text-slate-400">Tente ajustar seus termos de busca ou filtros de status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Pedido / Data</th>
                  <th className="py-3 px-4">Cliente / CNPJ</th>
                  <th className="py-3 px-4">Representante</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Valor Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => {
                  const statusConf = STATUS_CONFIG[ord.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block font-mono">
                          {ord.order_number}
                        </span>
                        <span className="text-[10px] text-slate-400">{ord.created_at}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{ord.customer_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ord.customer_document}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                          {ord.seller_name || 'Venda Online'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 uppercase block">{ord.payment_method}</span>
                        <span className={`text-[10px] font-bold ${ord.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {ord.payment_status === 'PAID' ? 'Liquidado' : 'Aguardando Pagamento'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        R$ {ord.total.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConf.bg}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">Pedido #{selectedOrder.order_number}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CONFIG[selectedOrder.status]?.bg}`}>
                    {STATUS_CONFIG[selectedOrder.status]?.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Emitido em: {selectedOrder.created_at}</p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6 text-xs">
              {/* Mudança Operacional de Status */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="font-bold text-slate-800">Alterar Status Operacional:</p>
                  <p className="text-[11px] text-slate-500">Atualiza o processo logístico em tempo real.</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['PENDING', 'SEPARATION', 'BILLED', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      disabled={updating || selectedOrder.status === st}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all ${
                        selectedOrder.status === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {STATUS_CONFIG[st]?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dados do Cliente & Entrega */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1">
                  <p className="font-bold text-slate-700">Cliente Varejista</p>
                  <p className="text-slate-900 font-semibold">{selectedOrder.customer_name}</p>
                  <p className="text-slate-500 font-mono">{selectedOrder.customer_document}</p>
                  <p className="text-slate-500">{selectedOrder.customer_phone} • {selectedOrder.customer_email}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-700">Entrega & Vendedor</p>
                  <p className="text-slate-600">{selectedOrder.shipping_address || 'Retirada no depósito'}</p>
                  <p className="text-brand-600 font-medium">Vendedor: {selectedOrder.seller_name}</p>
                  {selectedOrder.notes && (
                    <p className="text-amber-800 bg-amber-50 p-1.5 rounded text-[11px] mt-1 border border-amber-200">
                      Obs: {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800">Itens do Pedido ({selectedOrder.items?.length || 0})</h3>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.items?.map((it) => (
                    <div key={it.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'}
                          alt={it.product_name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{it.product_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {it.product_sku}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900">R$ {it.total_price.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-500">{it.quantity}x de R$ {it.unit_price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Desconto</span>
                    <span>- R$ {selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Frete</span>
                  <span>R$ {selectedOrder.shipping_fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Faturado</span>
                  <span className="text-brand-600">R$ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-100"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Espelho</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

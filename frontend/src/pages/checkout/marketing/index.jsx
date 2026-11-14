import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Tag, 
  UserCheck, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  MessageSquare,
  Gift
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../services/api';

export default function CheckoutMarketing() {
  const { 
    checkoutData, 
    setCheckoutData, 
    subtotal, 
    appliedCoupon, 
    setAppliedCoupon,
    selectedSeller,
    setSelectedSeller
  } = useCart();
  const navigate = useNavigate();

  const [sellers, setSellers] = useState([]);
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '');
  const [notes, setNotes] = useState(checkoutData.marketing?.notes || '');
  const [acceptOffers, setAcceptOffers] = useState(checkoutData.marketing?.accept_promotions ?? true);
  const [couponFeedback, setCouponFeedback] = useState(null);

  useEffect(() => {
    async function loadSellers() {
      try {
        const data = await api.getSellers(true);
        setSellers(data);
      } catch (err) {
        console.error('Erro ao buscar vendedores:', err);
      }
    }
    loadSellers();
  }, []);

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code) return;

    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon({ code: res.code, discount: res.discount });
        setCouponFeedback({ type: 'success', text: res.message });
      } else {
        setCouponFeedback({ type: 'error', text: res.message });
      }
    } catch {
      setCouponFeedback({ type: 'error', text: 'Não foi possível validar o cupom.' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCheckoutData((prev) => ({
      ...prev,
      marketing: {
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        notes: notes.trim(),
        accept_promotions: acceptOffers
      }
    }));
    navigate('/checkout/payment');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Indicador de Passos */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
        <Link to="/checkout/account" className="flex items-center gap-2 text-emerald-600">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</span>
          <span>Identificação</span>
        </Link>
        <div className="w-12 h-0.5 bg-brand-600"></div>
        <div className="flex items-center gap-2 text-brand-600">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">2</span>
          <span>Campanha & Vendedor</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">3</span>
          <span>Pagamento & Envio</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Campanhas Comerciais & Representante
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Vincule o pedido ao seu consultor regional e ative benefícios da distribuidora.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vínculo de Força de Vendas */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Representante Comercial Responsável
            </label>
            <p className="text-xs text-slate-500">
              Seu pedido será acompanhado diretamente pela equipe externa para conferência e agendamento da entrega.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                onClick={() => setSelectedSeller(null)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  !selectedSeller
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold text-xs">Venda Direta / Sem Vendedor</p>
                  <p className="text-[11px] text-slate-500">Atendimento central pelo portal</p>
                </div>
                {!selectedSeller && <Check className="w-4 h-4 text-brand-600" />}
              </div>

              {sellers.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSeller(s)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedSeller?.id === s.id
                      ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs">{s.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{s.code} • {s.region}</p>
                  </div>
                  {selectedSeller?.id === s.id && <Check className="w-4 h-4 text-brand-600" />}
                </div>
              ))}
            </div>
          </div>

          {/* Cupons de Campanha */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-brand-600" />
              Cupons e Campanhas Disponíveis
            </label>

            {/* Sugestões de Cupons Rápidos */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCouponCode('PRIMEIRACOMPRA');
                  handleApplyCoupon('PRIMEIRACOMPRA');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                <span>PRIMEIRACOMPRA (10% OFF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCouponCode('SALESDRIVE5');
                  handleApplyCoupon('SALESDRIVE5');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                <span>SALESDRIVE5 (5% OFF)</span>
              </button>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex justify-between items-center text-emerald-800">
                <span className="font-bold">Cupom Ativo: {appliedCoupon.code} (- R$ {appliedCoupon.discount.toFixed(2)})</span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código do cupom..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 uppercase text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Validar
                </button>
              </div>
            )}

            {couponFeedback && (
              <p className={`text-xs font-semibold ${couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {couponFeedback.text}
              </p>
            )}
          </div>

          {/* Instruções Especiais de Entrega */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-600" />
              Observações Comerciais & Horário de Recebimento
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Recebimento das 08h às 11h. Descarregar na doca dos fundos. Procurar por Seu Manoel."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none resize-none"
            />
          </div>

          {/* Opt-in Comunicação */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptOffers}
                onChange={(e) => setAcceptOffers(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <span>Desejo receber avisos de novas tabelas de preços e promoções no WhatsApp da loja.</span>
            </label>
          </div>

          {/* Ações */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <Link
              to="/checkout/account"
              className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Identificação</span>
            </Link>

            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
            >
              <span>Avançar para Pagamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

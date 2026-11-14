import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../services/api';
import { 
  Store, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

export default function CheckoutPayment() {
  const { cart, total, clearCart, checkoutData } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleFinalizarPedido = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const payload = {
        customer_name: checkoutData.customer?.name || 'Cliente da Loja',
        customer_email: checkoutData.customer?.email || 'cliente@papelaria.com',
        customer_phone: checkoutData.customer?.phone || '(14) 99888-7766',
        tipo_entrega: 'retirada',
        payment_method: paymentMethod,
        items: cart.map((it) => ({
          product_id: it.id,
          quantity: it.quantity
        }))
      };

      const res = await api.createOrder(payload);
      setCompletedOrder(res);
      clearCart();
    } catch (err) {
      alert('Falha ao emitir pedido com retirada: ' + (err.message || 'Erro inesperado'));
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Primeira Venda Digital Concluída!
          </span>
          <h1 className="text-3xl font-black text-slate-900">
            Pedido Emitido com Sucesso!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            O estoque físico já foi reservado na papelaria para você retirar sem fila.
          </p>
        </div>

        {/* Card do Código de Retirada */}
        <div className="bg-gradient-to-br from-brand-50 to-indigo-50 border-2 border-brand-300 rounded-3xl p-8 max-w-md mx-auto space-y-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Seu Código de Retirada no Balcão
          </span>
          <div className="text-4xl font-black font-mono text-brand-700 tracking-wider">
            {completedOrder.codigo_retirada}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pt-2 border-t border-brand-200/80">
            <Store className="w-4 h-4 text-brand-600" />
            <span>Papelaria & Bazar Central • Rua São Luiz, 450</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Apresente este código no balcão da loja física para retirar seus produtos imediatamente.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
          >
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
          Passo 2 de 2 • Pagamento & Retirada
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-1">
          Confirmação de Retirada na Loja Física
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          O caminho mais rápido e viável para o varejo local realizar a primeira venda digital.
        </p>
      </div>

      {/* Card da Loja de Retirada */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-brand-50 text-brand-700 rounded-xl">
          <Store className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">
            Retirada na Papelaria & Bazar Central
          </h3>
          <p className="text-xs text-slate-600">
            Rua São Luiz, 450 - Centro, Marília/SP • Tel: (14) 3413-0000
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Reserva de estoque garantida por até 2 horas</span>
          </div>
        </div>
      </div>

      {/* Métodos de Pagamento Simulado */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Forma de Pagamento (Simulada no Hackathon)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('PIX')}
            className={`p-4 rounded-xl border text-left transition ${
              paymentMethod === 'PIX'
                ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-bold text-xs text-slate-900">PIX Instantâneo</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Aprovação imediata para retirada</div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('BALCAO')}
            className={`p-4 rounded-xl border text-left transition ${
              paymentMethod === 'BALCAO'
                ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-bold text-xs text-slate-900">Pagar na Retirada (Balcão)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Pague no cartão ou dinheiro na loja física</div>
          </button>
        </div>

        {/* Resumo do Pedido */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">Total a Pagar:</span>
          <span className="text-2xl font-black text-brand-700">R$ {total.toFixed(2)}</span>
        </div>

        <button
          onClick={handleFinalizarPedido}
          disabled={submitting || cart.length === 0}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
        >
          <span>{submitting ? 'Reservando Estoque...' : 'Confirmar Pedido & Gerar Código de Retirada'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

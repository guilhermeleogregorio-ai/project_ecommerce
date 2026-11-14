import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Tag, 
  Check, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../services/api';

export default function StoreCart() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    discount, 
    shippingFee, 
    total, 
    appliedCoupon, 
    setAppliedCoupon 
  } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const minOrder = 150.0;
  const isMinOrderReached = subtotal >= minOrder;
  const remaining = Math.max(0, minOrder - subtotal);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await api.validateCoupon(couponCode, subtotal);
      if (res.valid) {
        setAppliedCoupon({ code: res.code, discount: res.discount });
        setCouponMsg({ type: 'success', text: res.message });
      } else {
        setCouponMsg({ type: 'error', text: res.message });
      }
    } catch (err) {
      setCouponMsg({ type: 'error', text: 'Erro ao validar cupom.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMsg(null);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Seu carrinho de compras está vazio</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Explore nosso catálogo para abastecer sua loja com as melhores marcas e condições do atacado.
        </p>
        <div className="pt-2">
          <Link
            to="/store/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Catálogo de Produtos</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Carrinho de Compras do Lojista
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Revise os itens e quantidades antes de prosseguir para identificação e pagamento.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Esvaziar Carrinho</span>
        </button>
      </div>

      {/* Alerta de Pedido Mínimo */}
      <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
        isMinOrderReached
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-center gap-2.5">
          {isMinOrderReached ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <p className="font-bold">
              {isMinOrderReached ? 'Pedido Mínimo Atingido!' : `Faltam R$ ${remaining.toFixed(2)} para o pedido mínimo`}
            </p>
            <p className="text-[11px] opacity-80">
              O valor mínimo para faturamento e despacho de mercadorias é de R$ {minOrder.toFixed(2)}.
            </p>
          </div>
        </div>

        <Link
          to="/store/catalog"
          className="px-3 py-1.5 rounded-lg bg-white font-bold text-slate-800 border border-slate-200 hover:bg-slate-50 transition-colors flex-shrink-0"
        >
          + Produtos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tabela de Produtos */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=160'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>
                    <p className="text-xs text-brand-600 font-semibold mt-1">
                      R$ {item.price.toFixed(2)} <span className="text-[11px] text-slate-400 font-normal">/{item.unit}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:self-center">
                  {/* Seletor de Qtd */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-extrabold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal do Item */}
                  <div className="text-right min-w-[90px]">
                    <p className="text-sm font-black text-slate-900">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Remover */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                    title="Excluir item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo do Pedido & Cupom */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Resumo do Faturamento
            </h2>

            {/* Aplicação de Cupom */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                Cupom de Parceria / Campanha
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <span className="font-bold">{appliedCoupon.code} (- R$ {appliedCoupon.discount.toFixed(2)})</span>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: PRIMEIRACOMPRA"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 uppercase text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </form>
              )}

              {couponMsg && (
                <p className={`text-[11px] font-medium ${
                  couponMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Detalhamento de Valores */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal dos Produtos</span>
                <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Desconto de Campanha</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frete Comercial</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">Grátis</span>
                  ) : (
                    `R$ ${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Estimado</span>
                <span className="text-brand-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botão de Prosseguir */}
            <button
              onClick={() => navigate('/checkout/account')}
              disabled={!isMinOrderReached}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                !isMinOrderReached
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-[0.99]'
              }`}
            >
              <span>Avançar para Identificação</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, subtotal, discount, shippingFee, total, totalItems } = useCart();
  const navigate = useNavigate();

  const minOrder = 150.0;
  const progressPercent = Math.min(100, (subtotal / minOrder) * 100);
  const remaining = Math.max(0, minOrder - subtotal);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout/account');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="font-extrabold text-slate-900 text-lg">Meu Pedido Comercial</h2>
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Progresso do Pedido Mínimo */}
          <div className="bg-slate-50 p-4 border-b border-slate-200">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Pedido Mínimo: R$ {minOrder.toFixed(2)}</span>
              {remaining > 0 ? (
                <span className="text-amber-700 font-bold">Faltam R$ {remaining.toFixed(2)}</span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Atingido!
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  remaining === 0 ? 'bg-emerald-500' : 'bg-brand-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 space-y-3">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Seu carrinho está vazio</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore nosso catálogo comercial e adicione fardos e embalagens ao seu pedido.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/store/catalog');
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Ir ao Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="pt-3 flex gap-3 items-center">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
                    <p className="text-xs font-extrabold text-brand-600 mt-0.5">
                      R$ {item.price.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/{item.unit}</span>
                    </p>

                    {/* Controles de Quantidade */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Remover produto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-900">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer com Resumo & CTA */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Desconto</span>
                    <span className="font-bold">- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete Comercial</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 uppercase font-bold">Grátis</span>
                    ) : (
                      `R$ ${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
                  <span>Total Previsto</span>
                  <span className="text-brand-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={subtotal < minOrder}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  subtotal < minOrder
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-[0.98]'
                }`}
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingCart, Bot, Zap, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({ onOpenCart }) {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="font-black text-slate-900 text-base tracking-tight block">
              Salesdrive
            </span>
            <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider block">
              Plataforma para Varejo Local
            </span>
          </div>
        </Link>

        {/* Links Principais */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/store/catalog"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-brand-600 rounded-lg text-xs font-bold transition"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo</span>
          </Link>

          <Link
            to="/commercial/orders"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
          >
            <Store className="w-3.5 h-3.5 text-slate-600" />
            <span>Rotina do Balcão</span>
          </Link>

          <Link
            to="/commercial/customers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand-800 rounded-lg text-xs font-bold transition"
          >
            <Bot className="w-3.5 h-3.5 text-brand-600" />
            <span>Agentes de IA</span>
          </Link>

          {/* Carrinho */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

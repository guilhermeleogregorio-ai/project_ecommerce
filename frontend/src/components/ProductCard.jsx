import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Check, Layers, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const minQty = product.min_quantity || 1;
  const [quantity, setQuantity] = useState(minQty);
  const [added, setAdded] = useState(false);

  const price = product.promo_price || product.price;
  const isPromo = product.promo_price && product.promo_price < product.price;

  const handleIncrement = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    setQuantity((q) => Math.max(minQty, q - 1));
  };

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Imagem do Produto */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badges Flutuantes */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {isPromo && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                OFERTA B2B
              </span>
            )}
            {product.featured && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                DESTAQUE
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
              {product.sku}
            </span>
          </div>
        </div>

        {/* Informações */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-brand-600 uppercase tracking-wider">{product.category_name || 'Geral'}</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Emb: {product.box_quantity} {product.unit}
            </span>
          </div>

          <Link to={`/store/product/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-sm hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-slate-500 text-xs line-clamp-2">
            {product.description || 'Produto de alta demanda para abastecimento comercial.'}
          </p>
        </div>
      </div>

      {/* Precificação e Ações */}
      <div className="p-4 pt-0 space-y-3">
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900">
              R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 font-medium">/{product.unit}</span>
            {isPromo && (
              <span className="text-xs text-slate-400 line-through">
                R$ {product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Preço Unitário Fracionado se for caixa/fardo */}
          {product.box_quantity > 1 && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Equivalente a <strong>R$ {(price / product.box_quantity).toFixed(2)}</strong> por unidade
            </p>
          )}

          {/* Status de Estoque */}
          <div className="mt-2 flex items-center justify-between text-[11px]">
            {product.stock > 30 ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Em Estoque ({product.stock} {product.unit})
              </span>
            ) : product.stock > 0 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Estoque Baixo ({product.stock} {product.unit})
              </span>
            ) : (
              <span className="text-rose-700 font-semibold">Sem Estoque</span>
            )}
            <span className="text-slate-400 text-[10px]">Mín: {minQty} {product.unit}</span>
          </div>
        </div>

        {/* Controles de Quantidade e Adição */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
            <button
              onClick={handleDecrement}
              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Diminuir"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-800">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Aumentar"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
              added
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-brand-500/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Pedir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

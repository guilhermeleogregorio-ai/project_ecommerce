import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check, 
  ShieldCheck, 
  Truck, 
  Layers, 
  FileText, 
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { api } from '../../../services/api';
import { useCart } from '../../../context/CartContext';

export default function StoreProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cep, setCep] = useState('');
  const [shippingResult, setShippingResult] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await api.getProduct(id);
        setProduct(data);
        setQuantity(data.min_quantity || 1);
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-xs mt-3">Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Produto não encontrado</h2>
        <Link
          to="/store/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo</span>
        </Link>
      </div>
    );
  }

  const price = product.promo_price || product.price;
  const minQty = product.min_quantity || 1;

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => Math.max(minQty, q - 1));

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleSimulateShipping = (e) => {
    e.preventDefault();
    if (cep.length >= 8) {
      setShippingResult({
        prazo: 'Entrega em até 24h úteis',
        valor: (price * quantity) >= 300 ? 0 : 25.0
      });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Navegação Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/store/catalog" className="hover:text-brand-600 flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Catálogo</span>
        </Link>
        <span>/</span>
        <span className="text-slate-700">{product.category_name}</span>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Galeria / Imagem Principal */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 relative group">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.promo_price && (
                <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                  TABELA ESPECIAL B2B
                </span>
              )}
              {product.featured && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  ALTO GIRO
                </span>
              )}
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-slate-900/80 backdrop-blur-sm text-white font-mono text-xs px-2.5 py-1 rounded-lg">
                SKU: {product.sku}
              </span>
            </div>
          </div>
        </div>

        {/* Informações Comerciais & Compra */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-wider">
              {product.category_name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description || 'Produto homologado para distribuição com embalagem industrial reforçada para transporte.'}
            </p>
          </div>

          {/* Dados de Embalagem e Unidades */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <p className="text-slate-400 font-medium text-[11px]">Unidade Venda</p>
              <p className="font-bold text-slate-900 mt-0.5">{product.unit}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[11px]">Qtd. Embalagem</p>
              <p className="font-bold text-slate-900 mt-0.5">{product.box_quantity} un / {product.unit}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[11px]">Pedido Mínimo</p>
              <p className="font-bold text-slate-900 mt-0.5">{minQty} {product.unit}</p>
            </div>
          </div>

          {/* Preço Comercial */}
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider block">Preço de Distribuição</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-medium text-slate-500">/{product.unit}</span>
                {product.promo_price && (
                  <span className="text-sm text-slate-400 line-through">
                    R$ {product.price.toFixed(2)}
                  </span>
                )}
              </div>
              {product.box_quantity > 1 && (
                <p className="text-xs text-slate-600 mt-1">
                  Sai por apenas <strong className="text-brand-700">R$ {(price / product.box_quantity).toFixed(2)}</strong> por unidade na ponta de gôndola.
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                5% OFF no PIX
              </span>
            </div>
          </div>

          {/* Tabela de Desconto por Volume B2B */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-brand-600" />
              Tabela de Desconto Progressivo por Volume
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="font-bold text-slate-900">1 a 4 {product.unit}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Preço Padrão</p>
              </div>
              <div className="p-2.5 bg-brand-50/50 rounded-xl border border-brand-200 text-center">
                <p className="font-bold text-brand-700">5 a 9 {product.unit}</p>
                <p className="text-emerald-600 font-semibold text-[11px] mt-0.5">3% de Desconto</p>
              </div>
              <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-center">
                <p className="font-bold text-emerald-800">10+ {product.unit}</p>
                <p className="text-emerald-700 font-bold text-[11px] mt-0.5">5% de Desconto</p>
              </div>
            </div>
          </div>

          {/* Seleção de Quantidade e CTA */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
              <button
                onClick={handleDecrement}
                className="p-3 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-extrabold text-slate-900">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="p-3 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-[0.99]'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Adicionado ao Pedido!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Adicionar ao Pedido • R$ {(price * quantity).toFixed(2)}</span>
                </>
              )}
            </button>
          </div>

          {/* Simulação de Frete e Prazo */}
          <div className="pt-4 border-t border-slate-100">
            <form onSubmit={handleSimulateShipping} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Informe seu CEP (ex: 14025-000)"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
                <Truck className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Calcular Frete
              </button>
            </form>

            {shippingResult && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-center text-slate-700">
                <span>{shippingResult.prazo}</span>
                <span className="font-bold text-emerald-600">
                  {shippingResult.valor === 0 ? 'Frete Grátis' : `R$ ${shippingResult.valor.toFixed(2)}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

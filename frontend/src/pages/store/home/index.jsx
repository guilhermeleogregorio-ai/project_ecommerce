import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import { api } from '../../../services/api';

export default function StoreHome() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await api.getProducts({ active_only: true });
        setProducts(data);
      } catch (err) {
        console.error('Erro ao buscar produtos da loja:', err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Banner da Papelaria de Bairro */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-slate-900 to-indigo-950 text-white shadow-xl p-8 sm:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold">
            <Store className="w-3.5 h-3.5 text-brand-400" />
            <span>Papelaria & Bazar Central • Varejo Físico Integrado</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Compre online e retire no balcão em minutos, sem fila!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Seus materiais escolares, papéis e itens de escritório com estoque em tempo real direto da loja física.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>Rua São Luiz, 450 - Centro</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Retirada Imediata com Código</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vitrine de Produtos */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Produtos Disponíveis para Retirada no Balcão
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Estoque sincronizado instantaneamente com o balcão da loja física.
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
            {products.length} itens no catálogo
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Carregando produtos da papelaria...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

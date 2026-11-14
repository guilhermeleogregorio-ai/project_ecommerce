import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Store,
  Bot,
  Building2,
  Package
} from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import { api } from '../../../services/api';

export default function StoreHome() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts({ active_only: true })
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Erro ao carregar dados da Home:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Receptivo & Moderno */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold tracking-wide">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>PLATAFORMA SALESDRIVE PARA QUALQUER LOJISTA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              A sua primeira venda online sem complicar a rotina da <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-300">loja física</span>.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Plataforma ajustável para qualquer comércio local: cadastre seus produtos, atenda clientes online e gerencie o estoque do balcão e retiradas com o apoio de agentes de IA.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/store/catalog"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 hover:translate-x-0.5"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/commercial/customers"
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-brand-400" />
                <span>Testar Agentes de IA</span>
              </Link>
            </div>

            {/* Micro Vantagens */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Reserva de Estoque</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Retirada sem Fila</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Assistente Inteligente</span>
              </div>
            </div>
          </div>

          {/* Card Visual de Demonstração em Tempo Real */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Estoque Integrado ao Balcão</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Tempo Real</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Pedido Digital #0101</span>
                    <span className="text-[11px] text-slate-400">Reserva online com código de retirada</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 text-xs font-mono font-bold">
                    CÓD: RET-98
                  </span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Consulta via IA</span>
                    <span className="text-[11px] text-slate-400">"Tem Coca 2L na gôndola?"</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    28 un Livres
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                <span>Controle antifalha de estoque</span>
                <span className="text-brand-400 font-semibold">100% Sincronizado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Departamentos & Categorias</h2>
            <p className="text-slate-500 text-sm mt-0.5">Explore os principais itens disponíveis na loja física e digital.</p>
          </div>
          <Link
            to="/store/catalog"
            className="text-brand-600 hover:text-brand-700 font-bold text-sm flex items-center gap-1 group"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/store/catalog?category_id=${cat.id}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/5 transition-all text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{cat.slug}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Vitrine de Produtos */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-black text-slate-900">Produtos em Destaque</h2>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Itens disponíveis com pronta retirada no balcão.</p>
          </div>

          <Link
            to="/store/catalog"
            className="text-brand-600 hover:text-brand-700 font-bold text-sm flex items-center gap-1"
          >
            <span>Catálogo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

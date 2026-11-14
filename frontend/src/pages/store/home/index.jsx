import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Zap, 
  TrendingUp, 
  Building2,
  PhoneCall,
  Search
} from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import { api } from '../../../services/api';

export default function StoreHome() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true })
        ]);
        setCategories(cats);
        setFeaturedProducts(prods);
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
      {/* Hero Banner Comercial */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold tracking-wide">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>PLATAFORMA SALESDRIVE PARA VAREJISTAS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              A sua primeira venda online sem complicar a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-300">loja física</span>.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Catálogo digital interativo com fardos, caixas e condições especiais direto da distribuidora. Atendimento assistido por representantes e pedidos integrados em tempo real.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/store/catalog"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 hover:translate-x-0.5"
              >
                <span>Acessar Catálogo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/admin/dashboard"
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
              >
                <span>Conhecer o Painel do Lojista</span>
              </Link>
            </div>

            {/* Micro Vantagens */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Faturamento a Prazo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Entrega em até 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Reposição Fácil</span>
              </div>
            </div>
          </div>

          {/* Card Flutuante de Exemplo de Venda */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Novo Pedido Faturado</span>
                </div>
                <span className="text-xs text-slate-400">Hoje às 14:20</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <p className="font-bold text-white text-sm">Mercado & Mercearia Bom Preço</p>
                    <p className="text-slate-400">CNPJ: 28.491.023/0001-44</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">
                    Aprovado
                  </span>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>4x Coca-Cola Original 2L (FD c/ 6)</span>
                    <span className="font-semibold text-white">R$ 187,60</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Arroz Camil 5kg (FD c/ 6)</span>
                    <span className="font-semibold text-white">R$ 319,80</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-sm text-brand-400">
                    <span>Total do Pedido</span>
                    <span>R$ 507,40</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Vendedor: <strong>Carlos Eduardo (REP-101)</strong></span>
                  <span>Pagamento: <strong>Boleto 30D</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias em Destaque */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Categorias de Abastecimento</h2>
            <p className="text-slate-500 text-sm mt-0.5">Explore os principais departamentos para sua loja e gôndola.</p>
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
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Produtos em Destaque / Mais Vendidos */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-black text-slate-900">Mais Pedidos no Atacado</h2>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Itens com maior giro de estoque e margem para o varejo.</p>
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
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner de Suporte com Força de Vendas */}
      <section className="rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 text-white p-8 lg:p-12 shadow-lg">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black">
            Precisa de um representante comercial na sua loja física?
          </h2>
          <p className="text-brand-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Nossos consultores da Salesdrive visitam seu comércio, organizam a reposição e garantem as melhores condições de pagamento faturado e bônus por volume.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/commercial/sellers"
              className="px-6 py-3 rounded-xl bg-white text-brand-700 hover:bg-brand-50 font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Ver Equipe de Representantes</span>
            </Link>
            <Link
              to="/store/catalog"
              className="px-6 py-3 rounded-xl bg-brand-800/80 hover:bg-brand-800 text-white font-bold text-sm border border-brand-400/30 transition-all"
            >
              <span>Comprar Online Agora</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

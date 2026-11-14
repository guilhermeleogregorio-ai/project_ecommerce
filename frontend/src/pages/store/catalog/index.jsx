import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal, 
  X, 
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import { api } from '../../../services/api';

export default function StoreCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category_id');
  const searchFromUrl = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl ? Number(categoryFromUrl) : null);
  const [search, setSearch] = useState(searchFromUrl || '');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category_id = selectedCategory;
        if (search.trim()) params.search = search.trim();
        const data = await api.getProducts(params);
        setProducts(data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, search]);

  const handleCategoryClick = (catId) => {
    const nextCat = selectedCategory === catId ? null : catId;
    setSelectedCategory(nextCat);
    if (nextCat) {
      searchParams.set('category_id', nextCat);
    } else {
      searchParams.delete('category_id');
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearch('');
    setInStockOnly(false);
    setSortBy('default');
    setSearchParams({});
  };

  // Filtragem e ordenação no cliente
  let filtered = [...products];
  if (inStockOnly) {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => (a.promo_price || a.price) - (b.promo_price || b.price));
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => (b.promo_price || b.price) - (a.promo_price || a.price));
  } else if (sortBy === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header do Catálogo */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Catálogo Comercial de Produtos
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Abastecimento inteligente para o comércio varejista • Preços e condições de atacado.
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Pesquisar por nome ou SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Painel Lateral de Filtros */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Filtros de Catálogo
              </span>
              {(selectedCategory || search || inStockOnly) && (
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] text-brand-600 hover:text-brand-800 font-bold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Categorias */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Categorias</p>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === null
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Todas as Categorias</span>
                  <span className="text-[10px] text-slate-400">{products.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Disponibilidade */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Disponibilidade</p>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Apenas produtos em estoque</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Listagem Principal de Produtos */}
        <main className="lg:col-span-3 space-y-6">
          {/* Barra de Controles: Quantidade de Resultados & Ordenação */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-slate-500">
              Mostrando <strong className="text-slate-900">{filtered.length}</strong> produtos disponíveis
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-brand-500"
                >
                  <option value="default">Relevância / Destaques</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="name-asc">Nome (A - Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Nenhum produto encontrado</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Não localizamos itens com os filtros atuais. Tente buscar por outros termos ou limpe os filtros.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

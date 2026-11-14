import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Store, LayoutDashboard, UserCheck, Shield, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({ onOpenCart }) {
  const { totalItems, selectedSeller, setSelectedSeller } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSellerMenu, setShowSellerMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/store/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const isStore = location.pathname.startsWith('/store') || location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/commercial');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner Informativo B2B */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Plataforma B2B & Força de Vendas Ativa
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">Pedido Mínimo: <strong className="text-white">R$ 150,00</strong></span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden md:inline">Desconto de <strong>5% à vista no PIX</strong></span>
          </div>

          {/* Seletor de Representante */}
          <div className="relative">
            <button
              onClick={() => setShowSellerMenu(!showSellerMenu)}
              className="flex items-center gap-1.5 hover:text-white transition-colors bg-slate-800 px-2.5 py-0.5 rounded text-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Vendedor: {selectedSeller ? selectedSeller.name : 'Venda Direta Online'}</span>
              <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
            </button>

            {showSellerMenu && (
              <div className="absolute right-0 mt-1 w-60 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Vincular Representante
                </div>
                <button
                  onClick={() => {
                    setSelectedSeller(null);
                    setShowSellerMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between ${
                    !selectedSeller ? 'bg-brand-50 text-brand-700 font-semibold' : ''
                  }`}
                >
                  <span>Loja Online Direta</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Padrão</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedSeller({ id: 1, code: 'REP-101', name: 'Carlos Eduardo Santos' });
                    setShowSellerMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between ${
                    selectedSeller?.code === 'REP-101' ? 'bg-brand-50 text-brand-700 font-semibold' : ''
                  }`}
                >
                  <span>Carlos Eduardo (REP-101)</span>
                  <span className="text-[10px] text-slate-400">Ribeirão</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedSeller({ id: 2, code: 'REP-102', name: 'Mariana Oliveira Costa' });
                    setShowSellerMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between ${
                    selectedSeller?.code === 'REP-102' ? 'bg-brand-50 text-brand-700 font-semibold' : ''
                  }`}
                >
                  <span>Mariana Oliveira (REP-102)</span>
                  <span className="text-[10px] text-slate-400">Franca</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Marca Salesdrive */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">sales<span className="text-brand-600">drive</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">B2B</span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-1 hidden sm:block">Distribuição & Loja Virtual</p>
            </div>
          </Link>

          {/* Barra de Busca de Produtos */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por produto, marca, SKU ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-transparent focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Links de Navegação e Alternância Storefront / Admin */}
          <div className="flex items-center gap-3">
            <Link
              to="/store/catalog"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/store/catalog')
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Catálogo</span>
            </Link>

            <Link
              to="/commercial/orders"
              className={`hidden lg:flex px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors items-center gap-1.5 ${
                location.pathname.startsWith('/commercial')
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Comercial</span>
            </Link>

            <Link
              to="/admin/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-brand-500" />
              <span className="hidden sm:inline">Painel Admin</span>
            </Link>

            {/* Botão de Carrinho */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-all hover:scale-105 active:scale-95"
              aria-label="Carrinho de Compras"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white font-bold text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

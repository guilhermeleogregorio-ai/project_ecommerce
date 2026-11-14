import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  UserCheck, 
  Settings, 
  Store,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function Sidebar() {
  const links = [
    {
      group: 'Visão Geral & Catálogo',
      items: [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard Executivo' },
        { to: '/admin/products', icon: Package, label: 'Gestão de Produtos' },
      ]
    },
    {
      group: 'Operação Comercial',
      items: [
        { to: '/commercial/orders', icon: ShoppingBag, label: 'Gestão de Pedidos' },
        { to: '/commercial/customers', icon: Users, label: 'Carteira de Clientes' },
        { to: '/commercial/sellers', icon: UserCheck, label: 'Força de Vendas' },
      ]
    },
    {
      group: 'Sistema',
      items: [
        { to: '/admin/settings', icon: Settings, label: 'Configurações da Loja' },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 border-r border-slate-800">
      <div className="space-y-6">
        {/* Banner do Módulo Admin */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Salesdrive Hub</p>
              <p className="text-[10px] text-slate-400">Ambiente Administrativo</p>
            </div>
          </div>
        </div>

        {/* Grupos de Menu */}
        <nav className="space-y-6">
          {links.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.group}
              </p>
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Atalho para Loja Virtual */}
      <div className="pt-4 border-t border-slate-800">
        <Link
          to="/store/catalog"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-brand-600 text-white text-xs font-medium transition-all group"
        >
          <Store className="w-4 h-4 text-brand-400 group-hover:text-white" />
          <span>Ver Loja do Comprador</span>
        </Link>
      </div>
    </aside>
  );
}

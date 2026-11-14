import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Store, 
  Bot, 
  Package, 
  Settings, 
  LayoutDashboard, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    {
      label: 'Rotina do Balcão & Retiradas',
      path: '/commercial/orders',
      icon: Store,
      badge: 'Loja Física'
    },
    {
      label: 'Agentes de IA (Orquestrador)',
      path: '/commercial/customers',
      icon: Bot,
      badge: 'Catálogo & Vendas'
    },
    {
      label: 'Catálogo de Produtos',
      path: '/admin/products',
      icon: Package
    },
    {
      label: 'Resumo Operacional & Alertas',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Configurações da Loja',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4.5rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3">
            Operação da Loja Física
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-brand-600" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] bg-brand-100/70 text-brand-800 px-1.5 py-0.5 rounded-md font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Card Informativo do Desafio Tray */}
        <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-brand-50 border border-brand-200/60 rounded-2xl">
          <div className="flex items-center gap-2 text-brand-900 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Desafio Tray Varejo</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Eliminando o atrito da primeira venda digital sem atrapalhar a rotina do lojista físico.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 px-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Papelaria Modelo (Tray)</span>
        <span className="font-mono text-[10px]">v2.0</span>
      </div>
    </aside>
  );
}

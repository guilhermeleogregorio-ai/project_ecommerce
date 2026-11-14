import React from 'react';
import { ShieldCheck, Truck, CreditCard, Headphones, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-16 border-t border-slate-800">
      {/* Vantagens Comerciais */}
      <div className="border-b border-slate-800 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Frete Especial p/ Região</p>
              <p className="text-[11px] text-slate-400">Grátis para pedidos acima de R$ 300,00</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Boleto Faturado & PIX</p>
              <p className="text-[11px] text-slate-400">Prazos de até 30 dias para lojistas</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Força de Vendas Integrada</p>
              <p className="text-[11px] text-slate-400">Atendimento presencial e online</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Procedência Garantida</p>
              <p className="text-[11px] text-slate-400">Produtos direto da indústria</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé com Informações da Empresa */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-white text-sm">salesdrive</p>
              <p className="text-slate-400 text-[11px]">Plataforma de E-commerce e Força de Vendas B2B</p>
            </div>
          </div>

          <div className="text-center md:text-right text-slate-400">
            <p>Salesdrive Distribuidora & Atacado Ltda • CNPJ: 12.345.678/0001-90</p>
            <p className="text-[11px] mt-0.5">Av. Independência, 2500 - Jardim Califórnia • Ribeirão Preto - SP</p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <p>© 2026 Salesdrive Tecnologia. Modelo MVP construído para Hackathon.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Termos Comerciais</span>
            <span className="hover:text-slate-400 cursor-pointer">Política de Privacidade</span>
            <span className="hover:text-slate-400 cursor-pointer">Suporte ao Varejista</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

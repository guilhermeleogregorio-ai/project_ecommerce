import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { User, Phone, Mail, ArrowRight, Store } from 'lucide-react';

export default function CheckoutAccount() {
  const { checkoutData, setCheckoutData } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: checkoutData.customer?.name || '',
    phone: checkoutData.customer?.phone || '',
    email: checkoutData.customer?.email || ''
  });

  const handlePreencherExemplo = () => {
    setFormData({
      name: 'Mariana Silva',
      phone: '(14) 99777-8899',
      email: 'mariana.silva@email.com'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCheckoutData((prev) => ({
      ...prev,
      customer: formData
    }));
    navigate('/checkout/payment');
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
          Passo 1 de 2 • Identificação Rápida
        </span>
        <h1 className="text-2xl font-black text-slate-900">
          Identifique-se para a Retirada
        </h1>
        <p className="text-xs text-slate-500">
          Apenas nome e telefone para você retirar sem atrito no balcão da loja física.
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-700">Dados do Comprador</span>
          <button
            type="button"
            onClick={handlePreencherExemplo}
            className="text-[11px] text-brand-600 hover:underline font-semibold"
          >
            Preencher Dados de Demonstração
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Seu Nome Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Ex: Mariana Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Telefone / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="(14) 99999-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              E-mail (opcional para envio do comprovante)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="mariana@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm mt-4"
          >
            <span>Ir para Opção de Pagamento e Retirada</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

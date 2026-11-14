import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';

export default function CheckoutAccount() {
  const { checkoutData, setCheckoutData } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: checkoutData.customer?.name || '',
    company_name: checkoutData.customer?.company_name || '',
    document: checkoutData.customer?.document || '',
    phone: checkoutData.customer?.phone || '',
    email: checkoutData.customer?.email || '',
    address: checkoutData.customer?.address || '',
    number: checkoutData.customer?.number || '',
    neighborhood: checkoutData.customer?.neighborhood || '',
    city: checkoutData.customer?.city || 'Ribeirão Preto',
    state: checkoutData.customer?.state || 'SP',
    zip_code: checkoutData.customer?.zip_code || ''
  });

  const handleFastFill = () => {
    setFormData({
      name: 'Marcos Vinicius (Gerente de Compras)',
      company_name: 'Mercado & Mercearia Bom Preço Ltda',
      document: '28.491.023/0001-44',
      phone: '(16) 99876-5432',
      email: 'compras@mercadobompreco.com.br',
      address: 'Rua Duque de Caxias',
      number: '840',
      neighborhood: 'Centro',
      city: 'Ribeirão Preto',
      state: 'SP',
      zip_code: '14015-020'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCheckoutData((prev) => ({
      ...prev,
      customer: formData
    }));
    navigate('/checkout/marketing');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Indicador de Passos */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
        <div className="flex items-center gap-2 text-brand-600">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">1</span>
          <span>Identificação</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">2</span>
          <span>Campanha & Vendedor</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">3</span>
          <span>Pagamento & Envio</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Dados Cadastrais do Varejista
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Informe os dados da empresa para faturamento e emissão do pedido.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFastFill}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Preenchimento Rápido (Demo)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand-600" />
              Dados da Loja / Comércio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Razão Social / Nome da Loja *</label>
                <input
                  type="text"
                  name="company_name"
                  required
                  placeholder="Ex: Supermercado São José Ltda"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CNPJ ou CPF *</label>
                <input
                  type="text"
                  name="document"
                  required
                  placeholder="00.000.000/0001-00"
                  value={formData.document}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Comprador / Responsável *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ex: João da Silva"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="(16) 99999-8888"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">E-mail para Nota Fiscal & Notificações</label>
                <input
                  type="email"
                  name="email"
                  placeholder="financeiro@seumercado.com.br"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              Endereço de Entrega da Mercadoria
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CEP *</label>
                <input
                  type="text"
                  name="zip_code"
                  required
                  placeholder="14000-000"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Logradouro / Rua *</label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Ex: Av. Saudade"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Número *</label>
                <input
                  type="text"
                  name="number"
                  required
                  placeholder="123"
                  value={formData.number}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Bairro *</label>
                <input
                  type="text"
                  name="neighborhood"
                  required
                  placeholder="Centro"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cidade / UF *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                  />
                  <input
                    type="text"
                    name="state"
                    required
                    maxLength={2}
                    value={formData.state}
                    onChange={handleChange}
                    className="w-14 text-center text-xs px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <Link
              to="/store/cart"
              className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Carrinho</span>
            </Link>

            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
            >
              <span>Avançar para Condições Comerciais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Target, 
  DollarSign, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  Share2, 
  Edit2, 
  Check, 
  X 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function CommercialSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    region: 'Ribeirão Preto e Região',
    commission_rate: 3.5,
    monthly_goal: 50000.0,
    current_sales: 0.0,
    active: true
  });

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const data = await api.getSellers();
      setSellers(data);
    } catch (err) {
      console.error('Erro ao buscar vendedores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleOpenCreate = () => {
    setEditingSeller(null);
    setFormData({
      name: '',
      code: `REP-${Math.floor(100 + Math.random() * 900)}`,
      phone: '',
      email: '',
      region: 'Ribeirão Preto e Região',
      commission_rate: 3.5,
      monthly_goal: 50000.0,
      current_sales: 0.0,
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingSeller(s);
    setFormData({
      name: s.name,
      code: s.code,
      phone: s.phone || '',
      email: s.email || '',
      region: s.region || '',
      commission_rate: s.commission_rate || 3.5,
      monthly_goal: s.monthly_goal || 50000.0,
      current_sales: s.current_sales || 0.0,
      active: s.active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSeller) {
        await api.updateSeller(editingSeller.id, formData);
      } else {
        await api.createSeller(formData);
      }
      setShowModal(false);
      fetchSellers();
    } catch (err) {
      alert(`Erro ao salvar vendedor: ${err.message}`);
    }
  };

  const copySellerLink = (code) => {
    const link = `${window.location.origin}/store/catalog?rep=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-brand-600" />
            <span>Força de Vendas Externa & Representantes</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Acompanhamento de metas comerciais, comissionamento e links de vendas assistidas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Representante</span>
        </button>
      </div>

      {/* Grid de Representantes */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Carregando força de vendas...</div>
      ) : sellers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">Nenhum vendedor cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((s) => {
            const goalPercent = Math.min(100, (s.current_sales / s.monthly_goal) * 100);
            const commission = (s.current_sales * s.commission_rate) / 100;

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                        {s.code}
                      </span>
                      <h3 className="font-black text-slate-900 text-base mt-1.5">{s.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.region || 'Região Central'}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.commission_rate}% Com.
                    </span>
                  </div>

                  {/* Informações de Contato */}
                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.phone || 'Sem telefone'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{s.email || 'Sem e-mail'}</span>
                    </p>
                  </div>

                  {/* Barra de Meta Comercial */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-brand-600" />
                        Meta Mensal ({goalPercent.toFixed(0)}%)
                      </span>
                      <span className="font-bold text-slate-900">
                        R$ {s.current_sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          goalPercent >= 100 ? 'bg-emerald-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${goalPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Meta: R$ {s.monthly_goal.toLocaleString('pt-BR')}</span>
                      <span className="font-semibold text-emerald-600">
                        Comissão: R$ {commission.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => copySellerLink(s.code)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    {copiedCode === s.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedCode === s.code ? 'Link Copiado!' : 'Copiar Link do Rep'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                    title="Editar representante"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="font-black text-lg text-slate-900">
                {editingSeller ? 'Editar Representante' : 'Novo Representante Comercial'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código do Vendedor *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Comissão (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Região de Atuação</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Meta Mensal de Vendas (R$)</label>
                <input
                  type="number"
                  step="1000"
                  value={formData.monthly_goal}
                  onChange={(e) => setFormData({ ...formData, monthly_goal: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700"
                >
                  Salvar Representante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

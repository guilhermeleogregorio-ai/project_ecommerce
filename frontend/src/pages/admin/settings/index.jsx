import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  CreditCard, 
  Truck, 
  Phone, 
  Mail, 
  Save, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../../../services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(`Erro ao salvar configurações: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-xs mt-3">Carregando parâmetros da distribuidora...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600" />
            <span>Configurações & Parâmetros Comerciais</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Defina regras de faturamento, pedido mínimo e dados da distribuidora.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Salvo com Sucesso!' : saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dados da Empresa */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>Dados Cadastrais da Distribuidora</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Razão Social</label>
              <input
                type="text"
                value={settings.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome Fantasia / Marca</label>
              <input
                type="text"
                value={settings.trade_name || ''}
                onChange={(e) => handleChange('trade_name', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CNPJ</label>
              <input
                type="text"
                value={settings.cnpj || ''}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp de Vendas</label>
              <input
                type="text"
                value={settings.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">E-mail Comercial & Notificações</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Endereço do Centro de Distribuição</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Políticas Comerciais & Faturamento */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-brand-600" />
            <span>Políticas de Faturamento & Pagamento</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pedido Mínimo (R$)</label>
              <input
                type="number"
                step="10"
                value={settings.min_order_value || 0}
                onChange={(e) => handleChange('min_order_value', Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Valor mínimo para liberar checkout</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Desconto no PIX (%)</label>
              <input
                type="number"
                step="0.5"
                value={settings.pix_discount_percent || 0}
                onChange={(e) => handleChange('pix_discount_percent', Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-bold text-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Aplicado sobre o valor final do pedido</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Frete Grátis a Partir de (R$)</label>
              <input
                type="number"
                step="50"
                value={settings.free_shipping_min || 0}
                onChange={(e) => handleChange('free_shipping_min', Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none font-bold text-brand-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Frete cortesia da distribuidora</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800">Habilitar Faturamento por Boleto Bancário (30 Dias)</p>
              <p className="text-[11px] text-slate-500">Permite que lojistas emitam pedidos a prazo sem cartão.</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_boleto}
                onChange={(e) => handleChange('enable_boleto', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

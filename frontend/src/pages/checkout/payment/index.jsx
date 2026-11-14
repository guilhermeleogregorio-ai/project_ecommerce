import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  QrCode, 
  Barcode, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Copy, 
  Check, 
  Store, 
  ExternalLink,
  Printer
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../services/api';

export default function CheckoutPayment() {
  const { 
    cart, 
    subtotal, 
    discount, 
    shippingFee, 
    total, 
    clearCart, 
    checkoutData, 
    selectedSeller 
  } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('PIX'); // 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  // Desconto adicional do PIX (5%)
  const pixDiscount = paymentMethod === 'PIX' ? Math.round(total * 0.05 * 100) / 100 : 0;
  const finalTotal = Math.max(0, total - pixDiscount);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const fullAddress = `${checkoutData.customer.address}, ${checkoutData.customer.number} - ${checkoutData.customer.neighborhood}, ${checkoutData.customer.city}/${checkoutData.customer.state} - CEP: ${checkoutData.customer.zip_code}`;

      const orderPayload = {
        customer_name: checkoutData.customer.company_name || checkoutData.customer.name,
        customer_document: checkoutData.customer.document,
        customer_phone: checkoutData.customer.phone,
        customer_email: checkoutData.customer.email,
        seller_id: selectedSeller?.id || null,
        seller_name: selectedSeller?.name || 'Venda Direta Online',
        subtotal: subtotal,
        discount: discount + pixDiscount,
        shipping_fee: shippingFee,
        total: finalTotal,
        payment_method: paymentMethod,
        coupon_code: checkoutData.marketing?.coupon_code || null,
        notes: checkoutData.marketing?.notes || null,
        shipping_address: fullAddress,
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          product_sku: item.sku,
          unit_price: item.price,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          image_url: item.image_url
        }))
      };

      const created = await api.createOrder(orderPayload);
      setCompletedOrder(created);
      clearCart();
    } catch (err) {
      alert(`Falha ao emitir pedido: ${err.message || 'Erro inesperado'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const copyPixCode = () => {
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136salesdrive-hub@pix.com.br5204000053039865405${finalTotal.toFixed(2)}5802BR5925SALESDRIVE DISTRIBUIDORA6014RIBEIRAO PRETO62070503***6304`;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // TELA DE SUCESSO DO PEDIDO
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Pedido Emitido com Sucesso
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">
              Pedido #{completedOrder.order_number}
            </h1>
            <p className="text-slate-500 text-xs">
              Uma via do espelho comercial foi enviada para {completedOrder.customer_email || 'o seu WhatsApp'}.
            </p>
          </div>

          {/* Dados do Pagamento Escolhido */}
          {completedOrder.payment_method === 'PIX' && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-brand-600" />
                  Pagamento Instantâneo PIX
                </span>
                <span className="text-xs font-black text-emerald-600">
                  Total: R$ {completedOrder.total.toFixed(2)}
                </span>
              </div>

              {/* Mock do QR Code */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 w-48 h-48 mx-auto flex flex-col items-center justify-center">
                <div className="w-40 h-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:8px_8px] border border-slate-300 rounded flex items-center justify-center">
                  <span className="text-[11px] font-bold text-slate-500 bg-white/90 px-2 py-1 rounded">QR Code PIX</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">Chave Copia e Cola:</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`00020126580014BR.GOV.BCB.PIX0136salesdrive-hub@pix.com.br52040000...`}
                    className="flex-1 text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-600 select-all"
                  />
                  <button
                    onClick={copyPixCode}
                    className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {completedOrder.payment_method === 'BOLETO' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-brand-600" />
                  Boleto Bancário Faturado (Prazo: 30 Dias)
                </span>
                <span className="text-xs font-black text-slate-900">
                  R$ {completedOrder.total.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                O boleto para 30 dias foi gerado com sucesso para a empresa <strong>{completedOrder.customer_name}</strong>.
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-700 flex justify-between items-center">
                <span>34191.79001 01043.510047 91020.150008 4 98200000{Math.round(completedOrder.total)}</span>
                <button
                  onClick={() => alert('Linha digitável copiada!')}
                  className="text-brand-600 hover:underline text-xs font-bold"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Resumo Resumido */}
          <div className="p-4 rounded-xl bg-slate-50 text-xs text-left space-y-1 text-slate-600">
            <p><strong>Destinatário:</strong> {completedOrder.customer_name}</p>
            <p><strong>Local de Entrega:</strong> {completedOrder.shipping_address}</p>
            <p><strong>Vendedor Vinculado:</strong> {completedOrder.seller_name}</p>
          </div>

          {/* Botões de Ação Final */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/commercial/orders"
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver Pedido no Painel Comercial</span>
            </Link>

            <Link
              to="/store/catalog"
              className="flex-1 py-3 px-4 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-brand-200"
            >
              <Store className="w-4 h-4" />
              <span>Continuar Comprando</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Indicador de Passos */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
        <Link to="/checkout/account" className="flex items-center gap-2 text-emerald-600">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</span>
          <span>Identificação</span>
        </Link>
        <div className="w-12 h-0.5 bg-emerald-600"></div>
        <Link to="/checkout/marketing" className="flex items-center gap-2 text-emerald-600">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">✓</span>
          <span>Campanha & Vendedor</span>
        </Link>
        <div className="w-12 h-0.5 bg-brand-600"></div>
        <div className="flex items-center gap-2 text-brand-600">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">3</span>
          <span>Pagamento & Envio</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Forma de Pagamento Comercial
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione a modalidade financeira autorizada para sua empresa.
          </p>
        </div>

        {/* Opções de Pagamento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Opção PIX */}
          <div
            onClick={() => setPaymentMethod('PIX')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative ${
              paymentMethod === 'PIX'
                ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">
                +5% OFF
              </span>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">PIX à Vista</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Aprovação imediata e separação prioritária</p>
            </div>
          </div>

          {/* Opção Boleto Faturado */}
          <div
            onClick={() => setPaymentMethod('BOLETO')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
              paymentMethod === 'BOLETO'
                ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-200'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Boleto Faturado</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Prazo de 30 dias para empresas cadastradas</p>
            </div>
          </div>

          {/* Opção Cartão de Crédito */}
          <div
            onClick={() => setPaymentMethod('CREDIT_CARD')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
              paymentMethod === 'CREDIT_CARD'
                ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-200'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">Cartão de Crédito</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Até 12x para pessoa jurídica ou física</p>
            </div>
          </div>
        </div>

        {/* Resumo Final do Pedido */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Espelho do Faturamento
          </h2>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal dos Produtos ({cart.length} itens)</span>
              <span className="font-semibold text-slate-800">R$ {subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Desconto de Campanha / Cupom</span>
                <span className="font-bold">- R$ {discount.toFixed(2)}</span>
              </div>
            )}

            {paymentMethod === 'PIX' && (
              <div className="flex justify-between text-emerald-600">
                <span>Desconto Especial PIX (5%)</span>
                <span className="font-bold">- R$ {pixDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Frete Comercial</span>
              <span className="font-semibold text-slate-800">
                {shippingFee === 0 ? <span className="text-emerald-600 uppercase font-bold">Grátis</span> : `R$ ${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
              <span>Total Final</span>
              <span className="text-brand-600">R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <Link
            to="/checkout/marketing"
            className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || cart.length === 0}
            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2"
          >
            {submitting ? (
              <span>Emitindo Pedido...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirmar e Emitir Pedido • R$ {finalTotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

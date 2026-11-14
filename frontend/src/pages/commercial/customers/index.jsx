import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  PackagePlus, 
  MessageSquare,
  HelpCircle,
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../../../services/api';

export default function AssistenteIA() {
  const [agenteTipo, setAgenteTipo] = useState('catalogo'); // 'catalogo' | 'vendas'
  const [solicitacao, setSolicitacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState([
    {
      remetente: 'ia',
      tipo: 'boas_vindas',
      texto: 'Olá! Sou o Assistente de IA da sua loja física. Posso conferir o estoque rapidamente em linguagem natural, estruturar um novo produto para você aprovar ou converter mensagens do WhatsApp em pedidos com retirada.'
    }
  ]);
  const [propostaPendente, setPropostaPendente] = useState(null);

  const exemplosCatalogo = [
    'Tem caderno 10 matérias no estoque?',
    'Onde fica a caneta BIC azul?',
    'Cadastrar Caderno Espiral por 24,90 com 30 unidades na Prateleira A1'
  ];

  const exemplosVendas = [
    'Oi, quero reservar 2 cadernos 10 matérias e 1 resma de sulfite para pegar no balcão hoje',
    'Separa 3 marca texto pastel pra mim retirar mais tarde'
  ];

  const handleEnviar = async (textoPersonalizado) => {
    const texto = textoPersonalizado || solicitacao;
    if (!texto.trim() || loading) return;

    const novaMensagemUsuario = { remetente: 'usuario', texto };
    setHistorico((prev) => [...prev, novaMensagemUsuario]);
    setSolicitacao('');
    setLoading(true);

    try {
      const res = await api.orquestrarAgente({
        loja_id: 1,
        agente: agenteTipo,
        solicitacao: texto
      });

      const resultado = res.resultado;

      if (resultado.tipo === 'proposta_cadastro') {
        setPropostaPendente(resultado.proposta);
        setHistorico((prev) => [
          ...prev,
          {
            remetente: 'ia',
            tipo: 'proposta',
            texto: resultado.resposta,
            proposta: resultado.proposta
          }
        ]);
      } else {
        setHistorico((prev) => [
          ...prev,
          {
            remetente: 'ia',
            tipo: 'resposta_geral',
            texto: resultado.resposta
          }
        ]);
      }
    } catch (err) {
      setHistorico((prev) => [
        ...prev,
        {
          remetente: 'ia',
          tipo: 'erro',
          texto: 'Erro ao processar solicitação: ' + err.message
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarCadastro = async () => {
    if (!propostaPendente) return;
    setLoading(true);
    try {
      const res = await api.orquestrarAgente({
        loja_id: 1,
        agente: 'catalogo',
        solicitacao: 'Confirmar cadastro de produto',
        confirmacao_payload: {
          confirmado: true,
          produto: {
            nome: propostaPendente.nome,
            sku: propostaPendente.sku,
            preco_centavos: propostaPendente.preco_centavos,
            estoque_atual: propostaPendente.estoque_atual,
            local_fisico: propostaPendente.local_fisico
          }
        }
      });
      setHistorico((prev) => [
        ...prev,
        {
          remetente: 'ia',
          tipo: 'sucesso',
          texto: `✅ Confirmação concluída! O produto "${propostaPendente.nome}" foi cadastrado no catálogo e no estoque físico!`
        }
      ]);
      setPropostaPendente(null);
    } catch (err) {
      alert('Erro ao confirmar cadastro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Autonomia & Confiança do Lojista (Desafio Tray)
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Orquestrador de Agentes de IA
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Agentes especializados para desonerar a rotina do atendente de balcão. O agente propõe, você confirma.
          </p>
        </div>

        {/* Seletor de Agente */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setAgenteTipo('catalogo')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              agenteTipo === 'catalogo' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Agente de Catálogo
          </button>
          <button
            onClick={() => setAgenteTipo('vendas')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              agenteTipo === 'vendas' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Agente de Mensagens / Zap
          </button>
        </div>
      </div>

      {/* Exemplos Rápidos */}
      <div className="bg-brand-50/60 border border-brand-200/60 rounded-2xl p-4">
        <span className="text-[11px] font-bold text-brand-900 block mb-2">
          💡 Experimente perguntar ao agente:
        </span>
        <div className="flex flex-wrap gap-2">
          {(agenteTipo === 'catalogo' ? exemplosCatalogo : exemplosVendas).map((ex, idx) => (
            <button
              key={idx}
              onClick={() => handleEnviar(ex)}
              className="text-xs bg-white text-slate-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-800 transition font-medium shadow-2xs"
            >
              "{ex}"
            </button>
          ))}
        </div>
      </div>

      {/* Caixa de Mensagens */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto">
        {historico.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl rounded-2xl p-4 text-xs ${
                msg.remetente === 'usuario'
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none space-y-2'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.texto}</p>

              {/* Card de Proposta para Confirmação do Lojista */}
              {msg.proposta && (
                <div className="mt-3 p-3.5 bg-white border border-brand-300 rounded-xl space-y-2 text-slate-800 shadow-xs">
                  <div className="font-bold text-xs text-brand-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>Proposta de Cadastro (Aguardando Confirmação)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-400">Produto:</span> <strong>{msg.proposta.nome}</strong></div>
                    <div><span className="text-slate-400">Preço:</span> <strong>{msg.proposta.preco_formatado}</strong></div>
                    <div><span className="text-slate-400">Estoque:</span> <strong>{msg.proposta.estoque_atual} un</strong></div>
                    <div><span className="text-slate-400">Local:</span> <strong>{msg.proposta.local_fisico}</strong></div>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleConfirmarCadastro}
                      disabled={loading}
                      className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      Confirmar e Salvar Produto
                    </button>
                    <button
                      onClick={() => setPropostaPendente(null)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input de Envio */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleEnviar();
        }}
        className="flex gap-3"
      >
        <input
          type="text"
          placeholder={
            agenteTipo === 'catalogo'
              ? 'Ex: "Tem sulfite A4?", "Cadastrar Lápis 2B por 2,50 com 50 un na Gaveta 1"'
              : 'Cole a mensagem recebida pelo WhatsApp para pré-reservar o pedido...'
          }
          value={solicitacao}
          onChange={(e) => setSolicitacao(e.target.value)}
          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        />
        <button
          type="submit"
          disabled={loading || !solicitacao.trim()}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
        >
          <span>Enviar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

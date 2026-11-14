import React, { useState, useEffect } from 'react';
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
  Clock,
  Server,
  Cpu,
  Layers,
  PlusCircle,
  Activity
} from 'lucide-react';
import { api } from '../../../services/api';

export default function AssistenteIA() {
  const [agenteTipo, setAgenteTipo] = useState('catalogo'); // 'catalogo' | 'vendas' | 'estoque'
  const [solicitacao, setSolicitacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [clusterInfo, setClusterInfo] = useState(null);
  const [historico, setHistorico] = useState([
    {
      remetente: 'ia',
      tipo: 'boas_vindas',
      texto: 'Olá! Sou o Orquestrador de Agentes de IA da sua loja física. Gerencio um pool distribuído de instâncias para conferir estoque, cadastrar produtos guiados ou converter mensagens do WhatsApp em pedidos com código de retirada.'
    }
  ]);
  const [propostaPendente, setPropostaPendente] = useState(null);

  const carregarCluster = async () => {
    try {
      const data = await api.getClusterStatus();
      setClusterInfo(data);
    } catch (e) {
      console.error('Falha ao carregar cluster:', e);
    }
  };

  useEffect(() => {
    carregarCluster();
    const interval = setInterval(carregarCluster, 8000);
    return () => clearInterval(interval);
  }, []);

  const exemplosCatalogo = [
    'Tem Coca-Cola 2L no estoque?',
    'Onde fica o sabonete Dove?',
    'Cadastrar Café Pilão 500g por 18,90 com 30 unidades na Gôndola A2'
  ];

  const exemplosVendas = [
    'Oi, reserva 2 Coca-Cola 2L e 1 Café Pilão pra eu retirar no balcão hoje',
    'Separa 3 sabonetes Dove pra mim retirar mais tarde'
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
      const dispatched = res.dispatched_to;

      if (resultado.tipo === 'proposta_cadastro') {
        setPropostaPendente(resultado.proposta);
        setHistorico((prev) => [
          ...prev,
          {
            remetente: 'ia',
            tipo: 'proposta',
            texto: resultado.resposta,
            proposta: resultado.proposta,
            dispatched
          }
        ]);
      } else {
        setHistorico((prev) => [
          ...prev,
          {
            remetente: 'ia',
            tipo: 'resposta_geral',
            texto: resultado.resposta,
            dispatched
          }
        ]);
      }
      carregarCluster();
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
          texto: `✅ Confirmação concluída! O produto "${propostaPendente.nome}" foi cadastrado no catálogo e no estoque físico da loja!`,
          dispatched: res.dispatched_to
        }
      ]);
      setPropostaPendente(null);
      carregarCluster();
    } catch (err) {
      alert('Erro ao confirmar cadastro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalarCluster = async () => {
    try {
      const tipo = agenteTipo === 'vendas' ? 'vendas' : 'catalogo';
      await api.adicionarInstancia({
        agent_type: tipo,
        name: `Agente ${tipo === 'vendas' ? 'WhatsApp' : 'Catálogo'} #AutoScaled`
      });
      await carregarCluster();
      alert('Nova instância criada com sucesso e anexada ao cluster!');
    } catch (e) {
      alert('Erro ao escalar instância: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Arquitetura de Orquestrador Distribuído
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Orquestrador Multi-Instância de Agentes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistema descentralizado com instâncias especializadas independentes para catálogo, WhatsApp e balcão.
          </p>
        </div>

        {/* Seletor de Agente */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setAgenteTipo('catalogo')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              agenteTipo === 'catalogo' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Instâncias Catálogo
          </button>
          <button
            onClick={() => setAgenteTipo('vendas')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              agenteTipo === 'vendas' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Instâncias WhatsApp
          </button>
        </div>
      </div>

      {/* Cluster Telemetry Panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="text-xs font-black tracking-wide uppercase text-slate-300">
                Orquestrador de Instâncias: ONLINE
              </span>
              <p className="text-[11px] text-slate-400">
                {clusterInfo ? `${clusterInfo.total_instances} instâncias registradas • Balanceamento Round-Robin` : 'Carregando cluster...'}
              </p>
            </div>
          </div>

          <button
            onClick={handleEscalarCluster}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Escalar +1 Instância</span>
          </button>
        </div>

        {/* Grid de Instâncias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {clusterInfo?.instances?.map((inst) => (
            <div 
              key={inst.instance_id}
              className={`p-3 rounded-xl border transition-all ${
                inst.status === 'busy' 
                  ? 'bg-amber-950/40 border-amber-600/50' 
                  : 'bg-slate-800/60 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[110px]">
                  {inst.instance_id}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                  inst.status === 'idle' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {inst.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{inst.name}</h4>
              <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                <span>{inst.total_requests} reqs</span>
                <span className="text-brand-400 font-mono">{inst.last_execution_time_ms}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sugestões Rápidas */}
      <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-brand-900">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Exemplos de comando para testar o despacho entre instâncias:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(agenteTipo === 'catalogo' ? exemplosCatalogo : exemplosVendas).map((ex, i) => (
            <button
              key={i}
              onClick={() => handleEnviar(ex)}
              className="text-xs bg-white hover:bg-brand-100 text-slate-700 border border-brand-200/80 rounded-lg px-3 py-1.5 text-left transition"
            >
              "{ex}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[550px] overflow-y-auto">
        {historico.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.remetente === 'usuario' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.remetente === 'usuario'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none space-y-3'
              }`}
            >
              {/* Badge da Instância que executou */}
              {msg.dispatched && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-200/80 text-[10px] font-mono text-slate-700">
                  <Cpu className="w-3 h-3 text-brand-600" />
                  <span>Instância: <strong>{msg.dispatched.instance_id}</strong> ({msg.dispatched.name})</span>
                </div>
              )}

              <div className="whitespace-pre-line">{msg.texto}</div>

              {/* Card de Proposta para Confirmação do Lojista */}
              {msg.tipo === 'proposta' && msg.proposta && (
                <div className="mt-3 p-3.5 bg-white rounded-xl border border-brand-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <PackagePlus className="w-4 h-4 text-brand-600" />
                      Proposta de Cadastro Estruturada
                    </span>
                    <span className="text-[11px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                      Requer Confirmação
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nome do Produto</span>
                      <strong className="text-slate-800">{msg.proposta.nome}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Preço Sugerido</span>
                      <strong className="text-emerald-600 font-bold">{msg.proposta.preco_formatado}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Estoque Inicial</span>
                      <strong className="text-slate-800">{msg.proposta.estoque_atual} unidades</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Local na Loja Física</span>
                      <strong className="text-slate-800">{msg.proposta.local_fisico}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPropostaPendente(null)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={handleConfirmarCadastro}
                      disabled={loading}
                      className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmar & Salvar Produto</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <div className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
            <span>Orquestrador despachando tarefa para instância disponível...</span>
          </div>
        )}
      </div>

      {/* Input de Envio */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleEnviar();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder={
            agenteTipo === 'catalogo'
              ? 'Ex: "Tem Coca-Cola 2L?", "Cadastrar Café Torrado por 18,90 com 20 un na Gôndola 1"'
              : 'Cole a mensagem recebida pelo WhatsApp para pré-reservar o pedido...'
          }
          value={solicitacao}
          onChange={(e) => setSolicitacao(e.target.value)}
          disabled={loading}
          className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-2xs"
        />
        <button
          type="submit"
          disabled={loading || !solicitacao.trim()}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-sm text-xs sm:text-sm"
        >
          <span>Enviar</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

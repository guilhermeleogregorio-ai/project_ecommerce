# Tray E-commerce — Desafio Varejo Local Inteligente
> **Facilitando a primeira venda digital na rotina da loja física através de agentes de IA e sincronização atômica de balcão.**

---

## 🎯 1. Contexto e Apresentação do Desafio (Tray)
Nascida em Marília/SP, a **Tray** impulsiona o e-commerce brasileiro há mais de 23 anos. O desafio proposto é:  
> *"Investigue o que adia a primeira venda digital no varejo tradicional e explore como a tecnologia pode facilitar esse primeiro passo na rotina da loja física."*

---

## 🔍 2. Barreira Investigada e Dados Públicos

### O Problema Real do Lojista Físico:
A maior barreira que adia a primeira venda digital do pequeno comerciante de bairro (ex: papelarias, bazares, pet shops) **não é a falta de canais, mas o medo do atrito na rotina da loja física**:
1. **Ruptura de Estoque / Venda Duplicada:** O atendente teme vender o último caderno no balcão presencial enquanto um cliente compra o mesmo item pela internet.
2. **Interrupção do Atendimento Presencial:** O atendente de balcão precisa parar de atender o cliente na loja física para ir até a prateleira conferir se há um item para quem mandou mensagem no WhatsApp.
3. **Complexidade Operacional:** Sistemas tradicionais de e-commerce exigem cadastros longos, painéis pesados de atacado/B2B e rotinas complexas que não cabem no dia a dia enxuto do pequeno varejo.

### Dados Oficiais (Cetic.br — TIC Empresas 2025):
- **81%** dos pequenos varejistas que vendem pela internet utilizam **mensagens ou chats (ex: WhatsApp)**.
- Apenas **30%** possuem **site próprio**.
- **Conclusão:** O lojista já recebe pedidos por mensagens, mas os trata de forma manual, desestruturada e com alto risco de errar o estoque do balcão.

---

## 💡 3. A Solução Proposta

Desenvolvemos uma plataforma pensada **de dentro para fora da loja física**, tendo como cenário prático a **Papelaria & Bazar Central**:

### 🛡️ A. Sincronização e Reserva Atômica de Estoque (`tx()` + WAL)
- Quando o consumidor compra online, o estoque entra em **`estoque_reservado`** e gera um **código de retirada de 6 dígitos**.
- A venda presencial de balcão confere o **saldo livre (`estoque_atual - estoque_reservado`)**, impedindo venda duplicada do último produto.
- Ao retirar no balcão, a entrega é confirmada pelo código e o estoque é baixado em definitivo.
- Se o cliente online não pagar ou não retirar no prazo configurado (ex: 2 horas), o sistema **libera a reserva automaticamente**.

### 🤖 B. Orquestrador de Agentes de IA (`/api/agentes/orquestrar`)
Dois agentes especializados concebidos sob o princípio da **Autonomia com Confirmação Humana**:
1. **Agente de Catálogo (Consulta & Cadastro Guiado):**
   - **Consulta de Balcão:** O atendente pergunta *"Tem caderno 10 matérias?"* ou *"Onde fica a caneta BIC azul?"* e a IA responde instantaneamente com saldo livre, total físico e localização exata na loja física (ex: *Prateleira A1*).
   - **Cadastro por Linguagem Natural:** O lojista dita *"Cadastrar Caderno Espiral por 24,90 com 30 unidades na Prateleira A1"*. O agente estrutura os atributos e **apresenta uma proposta para o lojista confirmar com 1 clique**.
2. **Agente de Vendas por Mensagem:**
   - O atendente cola mensagens do WhatsApp (*"Reserva 2 cadernos 10 matérias e 1 resma de sulfite para eu retirar hoje"*).
   - O agente interpreta a mensagem, reserva os produtos atomicamente e gera o código de retirada para envio ao cliente.

### 🏢 C. Adaptabilidade a Outros Segmentos (Multi-Loja)
- Todas as tabelas do banco de dados (`loja`, `usuario`, `produto`, `pedido`, `movimento_estoque`, `auditoria_evento`, `agente_execucao`) possuem isolamento por **`loja_id`**.
- O seed do sistema inclui **Papelaria & Bazar Central (`loja_id=1`)** e **Pet & Rações do Bairro (`loja_id=2`)**, demonstrando como a mesma tecnologia atende diferentes ramos do comércio tradicional.

---

## 🧪 4. Hipóteses Validadas e Próximos Passos com Lojistas

| Hipótese | Status no Protótipo | O que ainda precisa ser testado em campo |
| :--- | :--- | :--- |
| **H1: A retirada na loja reduz o custo e viabiliza a 1ª venda** | ✅ Validada com código de retirada e reserva | Medir a taxa de comparecimento do cliente no balcão físico em 24h. |
| **H2: A IA reduz o tempo de cadastro de produtos** | ✅ Validada com o Agente de Catálogo | Testar o cadastro com foto de etiqueta de preço direto pelo celular. |
| **H3: Converter WhatsApp em pedido reduz perdas de estoque** | ✅ Validada com o Agente de Vendas | Integrar a API do WhatsApp Business para pré-reserva automatizada. |
| **H4: O lojista confia mais quando a IA propõe e ele confirma** | ✅ Validada na interface com botão de aprovação | Acompanhar a curva de aprendizado do comerciante na primeira semana de uso. |

---

## 🚀 5. Como Executar o Projeto Rapidamente

### Em Um Clique (Windows):
Basta clicar duas vezes em:
```cmd
start_dev.bat
```
O script abre automaticamente o **Backend FastAPI** na porta `8000` e o **Frontend React** na porta `3000`.

### Execução Manual:
#### Backend:
```bash
pip install -r backend/requirements.txt
python backend/main.py
```
- API REST: [http://localhost:8000](http://localhost:8000)
- Swagger Interativo: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
- Loja & Balcão Físico: [http://localhost:3000](http://localhost:3000)
- Operação de Balcão & Retiradas: [http://localhost:3000/commercial/orders](http://localhost:3000/commercial/orders)
- Orquestrador de Agentes de IA: [http://localhost:3000/commercial/customers](http://localhost:3000/commercial/customers)

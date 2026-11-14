# Salesdrive — Plataforma de Varejo Local Inteligente (Desafio Tray)
> **Plataforma ajustável e intuitiva para capacitar qualquer lojista do varejo tradicional a realizar sua primeira venda digital integrada à rotina física do balcão.**

---

## 🎯 1. Contexto e Apresentação do Desafio (Tray)
Nascida em Marília/SP, a **Tray** impulsiona o e-commerce brasileiro há mais de 23 anos. O desafio proposto é:  
> *"Investigue o que adia a primeira venda digital no varejo tradicional e explore como a tecnologia pode facilitar esse primeiro passo na rotina da loja física."*

O **Salesdrive** foi desenvolvido como uma solução **ajustável a qualquer segmento de comércio local** (mercearias, empórios, papelarias, pet shops, lojas de conveniência e vestuário), permitindo que o próprio lojista cadastre sua loja e seus produtos de forma simples e imediata.

---

## 🔍 2. Barreira Investigada e Dados Públicos

### O Problema Real do Vendedor Local:
A maior barreira que adia a primeira venda digital do comerciante de bairro **não é a falta de canais, mas o medo do atrito na rotina da loja física**:
1. **Ruptura de Estoque / Venda Duplicada:** O lojista teme vender a última unidade no balcão presencial enquanto um cliente compra o mesmo item pela internet.
2. **Interrupção do Atendimento Presencial:** O atendente de balcão precisa parar de atender quem está na fila para ir até a prateleira conferir se há produto para quem mandou mensagem no WhatsApp.
3. **Complexidade Operacional:** Sistemas tradicionais de e-commerce exigem cadastros longos, painéis pesados de atacado/B2B e rotinas complexas que não cabem no dia a dia enxuto do pequeno varejo.

### Dados Oficiais (Cetic.br — TIC Empresas 2025):
- **81%** dos pequenos varejistas que vendem pela internet utilizam **mensagens ou chats (ex: WhatsApp)**.
- Apenas **30%** possuem **site próprio**.
- **Conclusão:** O comerciante já recebe pedidos por mensagens, mas os trata de forma manual, desestruturada e com alto risco de errar o estoque do balcão.

---

## 💡 3. A Solução Salesdrive: Plataforma Ajustável

O **Salesdrive** transforma a rotina do varejo físico em um ativo digital:

### 🛡️ A. Sincronização e Reserva Atômica de Estoque (`tx()` + WAL)
- Quando o consumidor compra online, o estoque entra em **`estoque_reservado`** e gera um **código de retirada de 6 dígitos**.
- A venda presencial de balcão confere o **saldo livre (`estoque_atual - estoque_reservado`)**, impedindo venda duplicada do último produto.
- Ao retirar no balcão, a entrega é confirmada pelo código e o estoque é baixado em definitivo.
- Se o cliente online não pagar ou não retirar no prazo configurado (ex: 2 horas), o sistema **libera a reserva automaticamente**.

### 🤖 B. Orquestrador de Agentes de IA (`/api/agentes/orquestrar`)
Dois agentes especializados concebidos sob o princípio da **Autonomia com Confirmação Humana**:
1. **Agente de Catálogo (Consulta & Cadastro Guiado):**
   - **Consulta de Balcão:** O atendente pergunta *"Tem Coca-Cola 2L no estoque?"* ou *"Onde fica o sabonete Dove?"* e a IA responde instantaneamente com saldo livre, total físico e localização na loja (ex: *Gôndola A2*).
   - **Cadastro por Linguagem Natural:** O lojista dita *"Cadastrar Café Torrado por 18,90 com 30 unidades na Gôndola A2"*. O agente estrutura os atributos e **apresenta uma proposta para o lojista confirmar com 1 clique**.
2. **Agente de Vendas por WhatsApp / Mensagens:**
   - O atendente cola mensagens do WhatsApp (*"Reserva 2 Coca-Cola 2L e 1 Café Pilão para eu retirar hoje"*).
   - O agente interpreta a mensagem, reserva os produtos atomicamente e gera o código de retirada para envio ao cliente.

### 🏢 C. Adaptabilidade Universal a Qualquer Comerciante (Multi-Loja)
- Todas as tabelas do banco de dados (`loja`, `usuario`, `produto`, `pedido`, `movimento_estoque`, `auditoria_evento`, `agente_execucao`) possuem isolamento nativo por **`loja_id`**.
- Qualquer lojista pode cadastrar sua unidade, personalizar taxas, horários de reserva e gerenciar seu mix de produtos.
- O sistema já vem com exemplos de lojas em segmentos distintos para demonstração da adaptabilidade.

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

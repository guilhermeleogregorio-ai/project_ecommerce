# Salesdrive MVP — Plataforma B2B & E-commerce para Varejistas Locais

> "Plataforma simplificada de e-commerce e força de vendas para ajudar pequenos varejistas locais a realizar sua primeira venda online sem atrapalhar a rotina da loja física."

Inspirado no modelo de sucesso da **Salesdrive (da Salespace Tecnologia)**, este projeto conecta distribuidoras, indústrias, representantes comerciais de campo e pequenos comerciantes (mercearias, padarias, minimercados e empórios) em um ecossistema digital unificado.

---

## 🚀 Como Executar o Projeto Rapidamente

### 1. Inicialização em Um Clique (Windows)
Basta clicar duas vezes no arquivo:
```cmd
start_dev.bat
```
Ou executar no PowerShell:
```powershell
.\start_dev.ps1
```

### 2. Inicialização Manual

#### Backend (FastAPI + SQLite)
```bash
# Na raiz do projeto:
pip install -r backend/requirements.txt
python backend/main.py
```
* **API REST**: [http://localhost:8000](http://localhost:8000)
* **Documentação Swagger Interativa**: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
* **Loja Virtual & Portal**: [http://localhost:3000](http://localhost:3000)

---

## 🌟 Funcionalidades Implementadas

### 🛒 Área do Comprador / Varejista (Storefront & Checkout)
1. **Vitrine & Home Comercial (`/store/home` ou `/`)**:
   - Hero com proposta de valor da plataforma e micro-vantagens para o comerciante.
   - Categorias rápidas (Bebidas, Alimentos, Higiene, Limpeza, Doces).
   - Vitrine de produtos em destaque e fardos de alto giro.
   - Banner de suporte para solicitação de visita de representante presencial.

2. **Catálogo Interativo de Atacado (`/store/catalog`)**:
   - Filtros dinâmicos por categoria, busca textual em tempo real e filtro de itens em estoque.
   - Ordenação inteligente por relevância, menor preço, maior preço e ordem alfabética.
   - Cards com cálculo de preço por caixa/fardo e equivalência fracionada por unidade.
   - Controles de quantidade respeitando pedido mínimo de cada produto.

3. **Ficha Técnica do Produto (`/store/product/:id`)**:
   - Galeria de imagens em alta definição.
   - Especificação de embalagem (fardo, caixa fechada, display).
   - Tabela de desconto progressivo por volume de compra (B2B).
   - Simulador de frete e prazos por CEP.

4. **Carrinho com Validação de Pedido Mínimo (`/store/cart`)**:
   - Barra de progresso visual do pedido mínimo (R$ 150,00).
   - Aplicação de cupons de desconto (`PRIMEIRACOMPRA`, `SALESDRIVE5`, `FRETEGRATIS`).
   - Resumo dinâmico de frete, descontos e total faturado.

5. **Fluxo de Checkout em 3 Etapas**:
   - **Etapa 1 - Identificação (`/checkout/account`)**: Cadastro rápido de CNPJ/Razão Social com botão de preenchimento de teste rápido (ideal para banca avaliadora).
   - **Etapa 2 - Campanha & Força de Vendas (`/checkout/marketing`)**: Atribuição do pedido a um representante comercial específico (ex: Carlos, Mariana, Rodrigo) para comissionamento, cupons e observações de entrega.
   - **Etapa 3 - Pagamento & Emissão (`/checkout/payment`)**: Modalidades de pagamento:
     - **PIX**: 5% de desconto automático, QR Code gerado e chave copia-e-cola.
     - **Boleto Faturado**: Prazo de 30 dias para lojistas cadastrados.
     - **Cartão de Crédito**: Até 12x para empresas.
   - **Tela de Sucesso**: Geração de código de pedido único rastreável (ex: `SD-2026-XXXXX`).

---

### 💼 Painel Administrativo & Gestão Comercial

1. **Dashboard Executivo (`/admin/dashboard`)**:
   - KPIs em tempo real: Faturamento Total, Volume de Pedidos, Ticket Médio e Varejistas Ativos.
   - Gráfico de evolução diária de vendas (últimos 7 dias).
   - Top 5 produtos campeões de vendas em receita e volume.
   - Alertas de giro crítico de estoque em depósito.
   - Desempenho e progresso das metas da equipe de vendas.

2. **Gestão de Produtos & Estoque (`/admin/products`)**:
   - Cadastro, edição e desativação de itens do catálogo.
   - Controle de saldos em estoque, unidades de medida e quantidades por embalagem.
   - Configuração de preços normais e promocionais.

3. **Gestão Operacional de Pedidos (`/commercial/orders`)**:
   - Listagem com filtros por status (`Pendente`, `Em Separação`, `Faturado`, `Entregue`, `Cancelado`).
   - Modal com espelho completo do pedido (itens, dados do cliente, vendedor e valores).
   - Alteração do status do ciclo de vida do pedido com persistência imediata.
   - Impressão de espelho para separação em expedição.

4. **Carteira de Clientes Varejistas (`/commercial/customers`)**:
   - Listagem e cadastro de lojistas locais com CNPJ, endereço e telefone.
   - Controle e barra de limite de crédito utilizado e disponível para faturamento a prazo.

5. **Força de Vendas & Representantes (`/commercial/sellers`)**:
   - Cadastro de representantes externos com código único e região.
   - Acompanhamento de metas mensais e cálculo automático de comissões.
   - Geração de link de vendedor para comissionamento automático de vendas online.

6. **Configurações Gerais da Loja (`/admin/settings`)**:
   - Parâmetros operacionais: valor mínimo de pedido, desconto para pagamento à vista no PIX, prazo padrão de boleto e frete cortesia.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, React Router v7.
* **Backend**: Python 3.12, FastAPI, Pydantic v2, Uvicorn.
* **Banco de Dados**: SQLite3 (banco relacional local persistido em `backend/database/ecommerce.db` com inicialização e seeds automáticos).

---

## 🎯 Dados de Demonstração (Seed)

O banco já vem pré-populado com:
* **Produtos reais de atacado e distribuição**: Coca-Cola 2L (FD c/ 6), Heineken (PK c/ 12), Arroz Camil 5kg (FD c/ 6), Sabão OMO 1.6kg, Chocolates Bis, etc.
* **Vendedores cadastrados**: Carlos Eduardo (REP-101), Mariana Oliveira (REP-102), Rodrigo Silveira (REP-103).
* **Varejistas locais cadastrados**: Supermercado Bom Preço, Panificadora Estrela D'Alva, Empório da Esquina, Mini Mercado São Jorge.
* **Histórico de pedidos em diferentes etapas operacionais**: para enriquecer gráficos e testes de ponta a ponta.

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorMsg = `Erro ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMsg = Array.isArray(errorJson.detail)
            ? errorJson.detail.map(d => d.msg).join(', ')
            : errorJson.detail;
        }
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    console.error(`Falha na requisição [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Produtos & Categorias (Papelaria Física & Digital)
  getCategories: () => request('/categories'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.active_only !== undefined) query.append('active_only', params.active_only);
    const qs = query.toString();
    return request(`/products${qs ? '?' + qs : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Pedidos e Retirada na Loja Física
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.codigo_retirada) query.append('codigo_retirada', params.codigo_retirada);
    const qs = query.toString();
    return request(`/orders${qs ? '?' + qs : ''}`);
  },
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, data) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Operação de Balcão da Loja Física
  registrarVendaBalcao: (items) => request('/balcao/venda', {
    method: 'POST',
    body: JSON.stringify({ items })
  }),
  concluirRetiradaBalcao: (codigo_retirada) => request('/balcao/retirar', {
    method: 'POST',
    body: JSON.stringify({ codigo_retirada })
  }),

  // Orquestrador de Agentes de IA (Catálogo & Vendas por Mensagem)
  orquestrarAgente: (data) => request('/agentes/orquestrar', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Configurações da Loja
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getLojas: () => request('/lojas'),

  // Métricas da Operação Local
  getDashboardMetrics: () => request('/dashboard/metrics')
};

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
  // Produtos & Categorias
  getCategories: () => request('/categories'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category_id) query.append('category_id', params.category_id);
    if (params.search) query.append('search', params.search);
    if (params.featured !== undefined) query.append('featured', params.featured);
    if (params.active_only !== undefined) query.append('active_only', params.active_only);
    const qs = query.toString();
    return request(`/products${qs ? '?' + qs : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Clientes
  getCustomers: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/customers${query}`);
  },
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Vendedores
  getSellers: (active_only = false) => request(`/sellers?active_only=${active_only}`),
  getSeller: (id) => request(`/sellers/${id}`),
  createSeller: (data) => request('/sellers', { method: 'POST', body: JSON.stringify(data) }),
  updateSeller: (id, data) => request(`/sellers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Pedidos
  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.customer_id) query.append('customer_id', params.customer_id);
    if (params.seller_id) query.append('seller_id', params.seller_id);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return request(`/orders${qs ? '?' + qs : ''}`);
  },
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, data) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Configurações & Cupons
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  validateCoupon: (code, subtotal) => request('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal })
  }),

  // Dashboard & KPIs
  getDashboardMetrics: () => request('/dashboard/metrics'),

  // Tráfego Pago Google
  getTrafficPlans: () => request('/traffic/plans'),
  getTrafficCampaigns: () => request('/traffic/campaigns'),
  createTrafficCampaign: (data) => request('/traffic/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  toggleTrafficCampaignStatus: (id) => request(`/traffic/campaigns/${id}/status`, { method: 'PATCH' }),
  simulateTraffic: (data) => request('/traffic/simulate', { method: 'POST', body: JSON.stringify(data) })
};

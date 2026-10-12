// API Client for Storefront and Admin Console
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('curator_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensures HttpOnly auth cookies are sent and received
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data?.details || []);
  }

  return data;
}

export const api = {
  // --- Public Storefront Endpoints ---
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },

  async getProductBySlug(slug) {
    return request(`/api/products/${encodeURIComponent(slug)}`);
  },

  async getCategories() {
    return request('/api/categories');
  },

  async getCategoryProducts(slug) {
    return request(`/api/categories/${encodeURIComponent(slug)}/products`);
  },

  async getHealth() {
    return request('/api/health');
  },

  async getSettings() {
    return request('/api/settings');
  },

  // --- Protected Admin Auth Endpoints ---
  async login(email, password) {
    const res = await request('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.token && typeof localStorage !== 'undefined') {
      localStorage.setItem('curator_token', res.token);
    }
    return res;
  },

  async logout() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('curator_token');
      }
      return await request('/api/admin/auth/logout', {
        method: 'POST',
      });
    } catch {
      return { success: true };
    }
  },

  async getMe() {
    return request('/api/admin/auth/me');
  },

  async updateAdminCredentials(data) {
    const res = await request('/api/admin/auth/credentials', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (res?.token && typeof localStorage !== 'undefined') {
      localStorage.setItem('curator_token', res.token);
    }
    return res;
  },

  // --- Protected Admin Dashboard & Analytics ---
  async getDashboard() {
    return request('/api/admin/dashboard');
  },

  async getAffiliateClicks() {
    return request('/api/admin/affiliate-clicks');
  },

  // --- Protected Admin Product Management ---
  async getAdminProducts(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    return request(`/api/admin/products${qs ? `?${qs}` : ''}`);
  },

  async getAdminProduct(id) {
    return request(`/api/admin/products/${encodeURIComponent(id)}`);
  },

  async createProduct(productData) {
    return request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id, productData) {
    return request(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id) {
    return request(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async togglePublish(id, status) {
    return request(`/api/admin/products/${encodeURIComponent(id)}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // --- Protected Admin Category Management ---
  async getAdminCategories() {
    return request('/api/admin/categories');
  },

  async createCategory(categoryData) {
    return request('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  async updateCategory(id, categoryData) {
    return request(`/api/admin/categories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  },

  async deleteCategory(id, reassignToCategoryId = null) {
    return request(`/api/admin/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({ reassignToCategoryId }),
    });
  },

  // --- Protected Admin Image Upload ---
  async uploadImage(base64Data, filename) {
    return request('/api/admin/upload-image', {
      method: 'POST',
      body: JSON.stringify({ base64Data, filename }),
    });
  },

  // --- Protected Admin Settings Management ---
  async getAdminSettings() {
    return request('/api/admin/settings');
  },

  async updateSettings(settingsData) {
    return request('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settingsData),
    });
  },
};


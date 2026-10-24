// Dynamic API base URL: respects VITE_API_BASE_URL env, or falls back to port 8000 on localhost, or relative path in production
const rawBase = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? `http://${window.location.hostname}:8000`
      : '');

export const API_BASE_URL = (rawBase || '').replace(/\/+$/, '');

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = API_BASE_URL ? `${API_BASE_URL}${cleanEndpoint}` : cleanEndpoint;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw new Error(data.detail || data.message || 'API request failed');
  }
  return data;
}

export const authAPI = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  signup: (company_name, email, phone, password) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ company_name, email, phone, password }),
  }),
  setupPassword: (email, password, company_name, phone) => request('/auth/setup-password', {
    method: 'POST',
    body: JSON.stringify({ email, password, company_name, phone }),
  }),
};

export const superAdminAPI = {
  getOrganizations: () => request('/super-admin/organizations'),
  getWallets: () => request('/super-admin/wallets'),
  getPlanRequests: () => request('/super-admin/plan-requests'),
  approvePlan: (requestId) => request(`/super-admin/approve-plan/${requestId}`, { method: 'POST' }),
  createOrganization: (orgData) => request('/super-admin/organization', {
    method: 'POST',
    body: JSON.stringify(orgData),
  }),
  deleteOrganization: (orgId) => request(`/super-admin/organization/${orgId}`, {
    method: 'DELETE',
  }),
};

export const clientAdminAPI = {
  getAdmins: () => request('/client-admin/all'),
  getDashboard: () => request('/client-admin/dashboard'),
  getPlanRequest: () => request('/client-admin/my-plan-request'),
  requestPlan: (plan_name, plan_price, custom_platforms) => request('/client-admin/request-plan', {
    method: 'POST',
    body: JSON.stringify({ plan_name, plan_price, custom_platforms }),
  }),
  createAdmin: (adminData) => request('/client-admin/create', {
    method: 'POST',
    body: JSON.stringify(adminData),
  }),
};

export const employeeAPI = {
  getEmployees: () => request('/employee/all'),
  getEmployee: (id) => request(`/employee/${id}`),
  createEmployee: (empData) => request('/employee/create', {
    method: 'POST',
    body: JSON.stringify(empData),
  }),
  updateEmployee: (id, empData) => request(`/employee/${id}`, {
    method: 'PUT',
    body: JSON.stringify(empData),
  }),
};

export const modelsAPI = {
  getAllModels: () => request('/models/all'),
  getMediaRates: () => request('/models/media-rates'),
  createModel: (modelData) => request('/models/create', {
    method: 'POST',
    body: JSON.stringify(modelData),
  }),
};

export const tokenAPI = {
  getAllTokens: () => request('/tokens/all'),
  createToken: (tokenData) => request('/tokens/create', {
    method: 'POST',
    body: JSON.stringify(tokenData),
  }),
};

export const usageLogAPI = {
  getAllLogs: () => request('/usage-logs/all'),
  createLog: (logData) => request('/usage-logs/create', {
    method: 'POST',
    body: JSON.stringify(logData),
  }),
};

export const recommendationAPI = {
  autoAnalyze: (orgId) => request(`/recommendations/auto-analyze/${orgId || 'default'}`),
  predictCost: (reqData) => request('/recommendations/predict-cost', {
    method: 'POST',
    body: JSON.stringify(reqData),
  }),
  evaluateVendors: (reqData) => request('/recommendations/evaluate-vendors', {
    method: 'POST',
    body: JSON.stringify(reqData),
  }),
};

export const chatAPI = {
  sendMessage: (chatData) => request('/chat/completions', {
    method: 'POST',
    body: JSON.stringify(chatData),
  }),
};

export const notificationAPI = {
  getNotifications: () => request('/notifications/'),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
};

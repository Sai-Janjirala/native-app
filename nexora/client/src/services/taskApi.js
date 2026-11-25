import { authApi, apiRequest } from '@/services/api';

export const taskApi = {
  getAll: (token) => apiRequest('/tasks', { token }),
  getDashboard: (token) => apiRequest('/tasks/dashboard', { token }),
  create: (token, payload) => apiRequest('/tasks', { method: 'POST', body: payload, token }),
  update: (token, id, payload) =>
    apiRequest(`/tasks/${id}`, { method: 'PUT', body: payload, token }),
  toggle: (token, id) => apiRequest(`/tasks/${id}/toggle`, { method: 'PATCH', token }),
  remove: (token, id) => apiRequest(`/tasks/${id}`, { method: 'DELETE', token }),
};

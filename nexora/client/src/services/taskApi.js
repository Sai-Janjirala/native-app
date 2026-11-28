import { apiRequest } from '@/services/api';

function withZone(path) {
  return `${path}?tzOffset=${new Date().getTimezoneOffset()}`;
}

export const taskApi = {
  getAll: (token) => apiRequest('/tasks', { token }),
  getDashboard: (token) => apiRequest(withZone('/tasks/dashboard'), { token }),
  getAnalytics: (token) => apiRequest(withZone('/tasks/analytics'), { token }),
  create: (token, payload) => apiRequest('/tasks', { method: 'POST', body: payload, token }),
  update: (token, id, payload) =>
    apiRequest(`/tasks/${id}`, { method: 'PUT', body: payload, token }),
  toggle: (token, id) => apiRequest(`/tasks/${id}/toggle`, { method: 'PATCH', token }),
  remove: (token, id) => apiRequest(`/tasks/${id}`, { method: 'DELETE', token }),
};

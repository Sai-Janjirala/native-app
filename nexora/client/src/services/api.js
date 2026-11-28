import { API_BASE_URL } from '@/constants/api';

const REQUEST_TIMEOUT_MS = 8000;

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function connectionError(error) {
  if (error?.name === 'AbortError') {
    return `Server took too long to respond at ${API_BASE_URL}. Check that the backend is running.`;
  }

  return `Cannot reach ${API_BASE_URL}. Start the backend and use the same Wi-Fi on your device.`;
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(connectionError(error));
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export const authApi = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  getMe: (token) => apiRequest('/auth/me', { token }),
  updateProfile: (token, payload) =>
    apiRequest('/auth/profile', { method: 'PUT', body: payload, token }),
};

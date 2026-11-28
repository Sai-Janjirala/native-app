import { API_BASE_URL } from '@/constants/api';
import * as Updates from 'expo-updates';

const REQUEST_TIMEOUT_MS = 60000;

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function connectionErrorMessage(error, defaultMsg) {
  const url = API_BASE_URL || 'unknown';
  const updateId = Updates?.updateId ? `[v${Updates.updateId.slice(0,8)}]` : 'embedded';

  if (error?.name === 'AbortError') {
    return `Timeout reaching ${url} ${updateId}. ${defaultMsg || 'The server took too long to respond. The backend may be starting up or experiencing high load. Please wait a moment and try again.'}`;
  }

  if (!API_BASE_URL) {
    return `Cannot reach the backend server. API URL was not configured. Check EXPO_PUBLIC_API_URL. ${defaultMsg || ''}`.trim();
  }

  const networkError = error?.message || error?.toString() || 'Unknown error';
  return `Cannot reach ${url} ${updateId}. ${networkError}`;
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
    throw new Error(connectionErrorMessage(error, 'Server timed out. Please try again.'));
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token && unauthorizedHandler) {
      unauthorizedHandler();
    }
    const errorMsg = data?.message || `Request failed (${response.status})`;
    throw new Error(connectionErrorMessage(null, errorMsg));
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
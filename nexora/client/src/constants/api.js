import Constants from 'expo-constants';
import { Platform } from 'react-native';

function normalizeBaseUrl(url) {
  const trimmed = url.replace(/\/+$/, '');
  return /\/api(\/|$)/i.test(trimmed) ? trimmed : `${trimmed}/api`;
}

function resolveApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:5000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

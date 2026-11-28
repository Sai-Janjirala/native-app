import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = 5000;

function normalizeBaseUrl(url) {
  const trimmed = String(url).trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /\/api(\/|$)/i.test(trimmed) ? trimmed : `${trimmed}/api`;
}

// Expo exposes the dev machine's address in a few different shapes depending
// on the runtime (Expo Go, dev client, classic manifest). Check them all so the
// app keeps following the laptop's current LAN IP instead of a stale hardcoded
// one.
function resolveDevHost() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.manifest?.debuggerHost,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      const host = candidate.split(':')[0];
      if (host) return host;
    }
  }

  return null;
}

function resolveApiBaseUrl() {
  // 1) Explicit override — also used for production APK builds.
  //    Set EXPO_PUBLIC_API_URL in client/.env (or your EAS build env).
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return normalizeBaseUrl(envUrl);
  }

  // 2) app.json / app.config.js -> expo.extra.apiUrl override.
  const extraUrl = Constants.expoConfig?.extra?.apiUrl;
  if (typeof extraUrl === 'string' && extraUrl.trim()) {
    return normalizeBaseUrl(extraUrl);
  }

  // 3) Auto-detect the laptop's current LAN IP from Expo Go / Metro.
  //    This keeps working when your hotspot or Wi-Fi IP changes.
  const host = resolveDevHost();
  if (host) {
    return `http://${host}:${DEFAULT_API_PORT}/api`;
  }

  // 4) Sensible platform fallbacks.
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_API_PORT}/api`;
  }
  return `http://localhost:${DEFAULT_API_PORT}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

if (__DEV__) {
  console.log(`[api] Using API base URL: ${API_BASE_URL}`);
}

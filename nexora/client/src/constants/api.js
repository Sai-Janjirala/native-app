import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = 5000;

// 3) Auto-detect the laptop's current LAN IP from Expo Go / Metro.
//    This keeps working when your hotspot or Wi‑Fi IP changes.
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

// 4) Sensible platform fallbacks — never hardcode a production URL in source.
const host = resolveDevHost();
const base =
  host
    ? `http://${host}`
    : Platform.OS === 'android'
      ? 'http://10.0.2.2'
      : 'http://localhost';

export const API_BASE_URL = base + '/' + DEFAULT_API_PORT + '/api';

if (__DEV__) {
  console.log(`[api] Using API base URL: ${API_BASE_URL}`);
}
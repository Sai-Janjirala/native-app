const RAW_API_URL = 'https://native-app-x5bs.onrender.com/api';
const SANITIZED_API_URL = RAW_API_URL.replace(/\s+/g, '');
const PROD_API_URL = SANITIZED_API_URL.length > 0 ? SANITIZED_API_URL : 'https://native-app-x5bs.onrender.com/api';
const URL_LENGTH = PROD_API_URL.length;

function getApiBaseUrl() {
  let envUrl = process?.env?.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    envUrl = envUrl.replace(/\s+/g, '');
  } else {
    envUrl = PROD_API_URL;
  }

  if (envUrl.endsWith('/api')) {
    return envUrl;
  }

  return envUrl + '/api';
}

export const API_BASE_URL = getApiBaseUrl();

if (__DEV__) {
  console.log(`[api] Using API base URL: ${API_BASE_URL}`);
  console.log(`[api] URL length: ${URL_LENGTH} characters`);
  console.log(`[api] Sanitized URL: ${PROD_API_URL}`);
}
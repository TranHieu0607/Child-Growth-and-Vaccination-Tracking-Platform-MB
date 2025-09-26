import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Resolve base URL from env/app config with sensible fallbacks
const resolveBaseURL = () => {
  // Prefer Expo public env first
  let url = process.env.EXPO_PUBLIC_API_BASE_URL
    || process.env.API_BASE_URL
    || undefined;

  // Fallback to app.json extra if available (evaluated at runtime)
  try {
    // Defer require to avoid circular deps if any
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appConfig = require('../../../app.json');
    const maybe = appConfig?.expo?.extra?.apiBaseUrl;
    url = url || maybe;
  } catch (_) {
    // ignore
  }

  // Final fallback to previous production URL
  url = url || 'https://api.kidditrack.site/api';

  // Android emulator cannot access localhost directly
  if (Platform.OS === 'android' && typeof url === 'string') {
    url = url.replace('http://localhost', 'http://10.0.2.2')
             .replace('https://localhost', 'http://10.0.2.2');
  }

  return url;
};

const axiosClient = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
  timeout: 20000,
});

// Thêm interceptor để tự động gắn token vào header với format Bearer
axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token && !config.headers?.Authorization) {
      // Luôn gửi format Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Không có token
  }
  return config;
});

// Response interceptor để retry 1 lần nếu lỗi mạng tạm thời
axiosClient.interceptors.response.use(
  (r) => r,
  async (err) => {
    const status = err?.response?.status;
    const cfg = err?.config;
    const isNetwork = !status && (err?.message?.includes('Network') || err?.code === 'ECONNABORTED');
    
    if (!cfg || cfg.__retried || status === 400 || status === 401) {
      // Không retry 400/401 vì là lỗi logic
      return Promise.reject(err);
    }
    
    if (isNetwork) {
      cfg.__retried = true;
      return axiosClient(cfg);
    }
    
    return Promise.reject(err);
  }
);

export default axiosClient;
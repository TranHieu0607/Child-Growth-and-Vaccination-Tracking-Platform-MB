import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosClient = axios.create({
  baseURL: 'https://api.kidditrack.site/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
  timeout: 15000,
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
    const isNetwork = !status && (err.code === "ECONNABORTED" || err.message?.includes("Network"));
    
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
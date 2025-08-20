import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosClient = axios.create({
  baseURL: 'https://api.kidditrack.site/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
});

// Thêm interceptor để tự động gắn token vào header nếu có
axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = token; // Sử dụng token trực tiếp như trong curl
    }
  } catch (e) {
    // Không có token
  }
  return config;
});

export default axiosClient;
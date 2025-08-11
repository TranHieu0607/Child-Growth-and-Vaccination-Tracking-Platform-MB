import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const axiosClient = axios.create({
  baseURL: 'https://kidtrackingapi20250811180547-e5d6e9b0e9ddaaf2.southeastasia-01.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'text/plain',
  },
});

// Thêm interceptor để tự động gắn token vào header nếu có
axiosClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Không có token
  }
  return config;
});

export default axiosClient; 
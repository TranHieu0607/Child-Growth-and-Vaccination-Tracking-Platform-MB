import axiosClient from './axiosClient';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Nếu BE yêu cầu số thay vì chuỗi
const USE_NUMERIC_DEVICE_TYPE = false;

function deviceTypeToBackend() {
  if (!USE_NUMERIC_DEVICE_TYPE) {
    return Platform.OS === 'android' ? 'Android' : 'iOS';
  }
  // Mapping số, chỉnh theo BE nếu khác
  return Platform.OS === 'android' ? 0 : 1;
}

function sanitizeDeviceInfo(input, max = 255) {
  if (!input) return '';
  const trimmed = input.trim().replace(/\s+/g, ' ');
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

// Cache trong runtime để tránh spam trong cùng phiên
let lastRegisteredToken = null;

const deviceTokenApi = {
  // Đăng ký device token
  registerDeviceToken: async (pushToken, deviceType, deviceInfo) => {
    if (!pushToken || typeof pushToken !== 'string') {
      throw new Error('Push token is missing/invalid');
    }

    if (lastRegisteredToken === pushToken) {
      console.log('[deviceTokenApi] Skipping duplicate token registration:', pushToken);
      return { skipped: true, reason: 'duplicate_in_session' };
    }

    let payload = {
      token: pushToken,
      deviceType: deviceType ?? deviceTypeToBackend(),
      deviceInfo: sanitizeDeviceInfo(deviceInfo || ''),
    };

    const tryRegister = async () => {
      const res = await axiosClient.post('/DeviceToken/register', payload);
      // Lưu cache & SecureStore sau khi thành công
      lastRegisteredToken = pushToken;
      await SecureStore.setItemAsync('pushToken', pushToken);
      console.log('[deviceTokenApi] Success response:', res.data);
      return res?.data ?? res;
    };

    try {
      console.log('[deviceTokenApi] Request payload:', JSON.stringify(payload, null, 2));
      return await tryRegister();
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const msg = (data?.error || data?.message || '').toString().toLowerCase();

      console.log('[deviceTokenApi] Response status:', status);
      console.log('[deviceTokenApi] Response data:', data);

      // ===== Fallback #1: nghi duplicate → remove rồi đăng ký lại =====
      if (status === 400 && (msg.includes('duplicate') || msg.includes('unique'))) {
        try {
          console.log('[deviceTokenApi] Duplicate detected, removing then retrying...');
          await axiosClient.delete('/DeviceToken/remove', { params: { token: pushToken } });
          const res = await tryRegister();
          return res;
        } catch (removeErr) {
          console.log('[deviceTokenApi] Remove failed (ignored):', removeErr?.response?.data || removeErr?.message);
        }
      }

      // ===== Fallback #2: nghi lỗi độ dài → rút ngắn deviceInfo và thử lại =====
      if (status === 400 && (msg.includes('truncated') || msg.includes('length'))) {
        const shorter = sanitizeDeviceInfo(payload.deviceInfo || '', 120);
        if (shorter !== payload.deviceInfo) {
          payload = { ...payload, deviceInfo: shorter };
          try {
            console.log('[deviceTokenApi] Retrying with shorter deviceInfo:', shorter);
            const res = await tryRegister();
            return res;
          } catch (err2) { /* rơi xuống throw chung */ }
        }
      }

      throw error;
    }
  },

  // Xoá device token (khi logout)
  removeDeviceToken: async (pushToken) => {
    if (!pushToken || typeof pushToken !== 'string') {
      throw new Error('Push token is missing/invalid for removal');
    }

    try {
      console.log('[deviceTokenApi] Removing device token:', pushToken);
      const res = await axiosClient.delete('/DeviceToken/remove', { params: { token: pushToken } });
      console.log('[deviceTokenApi] Device token removed successfully');
      return res?.data ?? res;
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      // ✅ COI 404 LÀ THÀNH CÔNG IDEMPOTENT
      if (status === 404) {
        console.log('[deviceTokenApi] Remove: token not found (treat as success)');
        return { ok: true, message: 'Device token not found (treated as removed)' };
      }

      console.log('[deviceTokenApi] Remove device token failed - Status:', status);
      console.log('[deviceTokenApi] Remove device token failed - Data:', data);
      console.log('[deviceTokenApi] Remove device token failed - Error:', error?.message || error);
      throw error;
    }
  },

  // Reset cache runtime (gọi sau logout)
  resetCache: () => {
    lastRegisteredToken = null;
  },
};

export default deviceTokenApi;

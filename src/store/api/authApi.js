import axiosClient from './axiosClient';
import { Platform } from 'react-native';

/**
 * Đăng ký tài khoản người dùng
 * @param {object} payload
 * @returns {Promise<any>}
 */
// NOTE: Keep API layer pure. Thunks should dispatch in UI layer, not here.
export async function registerUser(payload) {
  const response = await axiosClient.post('/auth/register', payload);
  return response.data;
}

/**
 * Đăng nhập tài khoản người dùng
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function loginUser(payload) {
  const response = await axiosClient.post('/auth/login', payload);
  return response.data;
}

/**
 * Gửi OTP đăng ký đến email (không lưu token)
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function requestRegistrationOtp(payload) {
  const response = await axiosClient.post('/auth/register', payload);
  return response.data;
}

/**
 * Hoàn tất đăng ký bằng OTP
 * @param {{ email: string, otpCode: string }} payload
 * @returns {Promise<any>}
 */
export async function completeRegistration(payload) {
  const response = await axiosClient.post('/auth/complete-registration', payload);
  return response.data;
}

/**
 * Yêu cầu đặt lại mật khẩu (gửi OTP/Link qua email)
 * @param {{ email: string }} payload
 * @returns {Promise<any>}
 */
export async function requestPasswordReset(payload) {
  const response = await axiosClient.post('/auth/forgot-password', payload);
  return response.data;
}

/**
 * Đặt lại mật khẩu bằng OTP
 * @param {{ email: string, otpCode: string, newPassword: string }} payload
 * @returns {Promise<any>}
 */
export async function resetPassword(payload) {
  const response = await axiosClient.post('/auth/reset-password', payload);
  return response.data;
}

/**
 * Cập nhật hồ sơ thành viên (multipart) theo API mới /Accounts/update-member-info
 * Chấp nhận optional avatar giống Register.js: { uri, fileName, type }
 * @param {{ fullName?: string, phoneNumber?: string, address?: string, avatar?: { uri: string, fileName?: string, type?: string } }} payload
 * @returns {Promise<any>}
 */
export async function updateMemberProfile(payload) {
  const form = new FormData();
  if (payload?.fullName != null) form.append('FullName', payload.fullName);
  if (payload?.phoneNumber != null) form.append('PhoneNumber', payload.phoneNumber);
  if (payload?.address != null) form.append('Address', payload.address);

  const avatar = payload?.avatar;
  if (avatar?.uri) {
    const imageUri = Platform.OS === 'ios'
      ? (avatar.uri.startsWith('file://') ? avatar.uri.replace('file://', '') : avatar.uri)
      : avatar.uri; // Keep file:// on Android
    form.append('ImageUrl', {
      uri: imageUri,
      name: avatar.fileName || `avatar_${Date.now()}.jpg`,
      type: avatar.type || 'image/jpeg',
    });
  }

  const response = await axiosClient.put('/Accounts/update-member-info', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Lấy thông tin tài khoản hiện tại (yêu cầu Authorization token)
 * @returns {Promise<any>}
 */
export async function getCurrentAccount() {
  const response = await axiosClient.get('/Accounts/me');
  return response.data;
}
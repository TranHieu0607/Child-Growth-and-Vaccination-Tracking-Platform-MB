import { register, login } from '../authSlice';
import store from '../store';
import axiosClient from './axiosClient';

/**
 * Đăng ký tài khoản người dùng
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function registerUser(payload) {
  const resultAction = await store.dispatch(register(payload));
  if (register.fulfilled.match(resultAction)) {
    return resultAction.payload;
  } else {
    throw resultAction.payload || resultAction.error;
  }
}

/**
 * Đăng nhập tài khoản người dùng
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function loginUser(payload) {
  const resultAction = await store.dispatch(login(payload));
  if (login.fulfilled.match(resultAction)) {
    return resultAction.payload;
  } else {
    throw resultAction.payload || resultAction.error;
  }
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
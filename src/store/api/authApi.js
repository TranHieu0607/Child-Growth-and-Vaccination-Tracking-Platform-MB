import axiosClient from './axiosClient';

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
 * Cập nhật hồ sơ thành viên (yêu cầu Authorization token)
 * @param {{ fullName?: string, phoneNumber?: string, address?: string }} payload
 * @returns {Promise<any>}
 */
export async function updateMemberProfile(payload) {
  const response = await axiosClient.put('/auth/update-member-profile', payload);
  return response.data;
}
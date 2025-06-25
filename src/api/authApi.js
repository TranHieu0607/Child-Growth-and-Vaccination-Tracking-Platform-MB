import { register, login } from '../store/authSlice';
import store from '../store/store';

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
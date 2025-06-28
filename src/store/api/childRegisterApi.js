import childrenApi from './childrenApi';

/**
 * Đăng ký thông tin trẻ mới cùng chỉ số tăng trưởng ban đầu
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function registerChildWithGrowth(payload) {
  const res = await childrenApi.createChildWithGrowthRecord(payload);
  return res.data;
} 
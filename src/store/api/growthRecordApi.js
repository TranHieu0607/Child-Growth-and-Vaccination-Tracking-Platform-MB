import childrenApi from './childrenApi';

/**
 * Lấy danh sách trẻ của tài khoản hiện tại
 * @returns {Promise<any[]>}
 */
export async function getMyChildren() {
  const res = await childrenApi.getMyChildren();
  return res.data;
}

/**
 * Cập nhật chỉ số tăng trưởng cho 1 trẻ
 * @param {string} childId
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function updateGrowthRecord(childId, payload) {
  const res = await childrenApi.updateGrowthRecord(childId, payload);
  return res.data;
} 
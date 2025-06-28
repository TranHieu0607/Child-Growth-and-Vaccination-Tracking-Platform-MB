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
 * Lấy chi tiết 1 trẻ theo childId
 * @param {string} childId
 * @returns {Promise<any>}
 */
export async function getChildById(childId) {
  const res = await childrenApi.getChildById(childId);
  return res.data;
} 
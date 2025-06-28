import childrenApi from './childrenApi';

/**
 * Lấy danh sách nhật ký hằng ngày của 1 trẻ
 * @param {string} childId
 * @returns {Promise<any[]>}
 */
export async function getDailyRecordsByChildId(childId) {
  const res = await childrenApi.getDailyRecordsByChildId(childId);
  return res.data;
}

/**
 * Tạo nhật ký hằng ngày mới cho 1 trẻ
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function createDailyRecord(payload) {
  const res = await childrenApi.createDailyRecord(payload);
  return res.data;
} 
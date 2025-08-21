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

/**
 * Cập nhật nhật ký hằng ngày theo id
 * @param {number|string} dailyRecordId
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function updateDailyRecord(dailyRecordId, payload) {
  const res = await childrenApi.updateDailyRecord(dailyRecordId, payload);
  return res.data;
}

/**
 * Xóa nhật ký hằng ngày theo id
 * @param {number|string} dailyRecordId
 * @returns {Promise<any>}
 */
export async function deleteDailyRecord(dailyRecordId) {
  const res = await childrenApi.deleteDailyRecord(dailyRecordId);
  return res.data;
}
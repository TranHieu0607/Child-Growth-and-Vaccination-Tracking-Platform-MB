import axiosClient from './axiosClient';

/**
 * API for growth prediction
 */
const growthPredictionApi = {
  /**
   * Lấy dự đoán tăng trưởng cho trẻ
   * @param {number} childId - ID của trẻ
   * @param {number} days - Số ngày dự đoán (mặc định 30)
   * @returns {Promise} - Dữ liệu dự đoán
   */
  getGrowthPrediction: (childId, days = 30) => {
    return axiosClient.get(`/GrowthAssessment/child/${childId}/prediction?days=${days}`);
  },
};

export default growthPredictionApi;

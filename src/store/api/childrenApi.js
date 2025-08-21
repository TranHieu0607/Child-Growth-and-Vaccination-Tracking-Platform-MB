import axiosClient from './axiosClient';

const childrenApi = {
  getMyChildren: () => axiosClient.get('/Children/my-children'),
  deleteChild: (childId) => axiosClient.delete(`/Children/${childId}`),
  getChildById: async (childId) => {
    const response = await axiosClient.get(`/Children/${childId}`);
    return response;
  },
  getGrowthRecordsByChildId: (childId) => axiosClient.get(`/GrowthRecords/child/${childId}`),
  getLatestGrowthAssessment: (childId) => axiosClient.get(`/GrowthAssessment/child/${childId}/latest`),
  createChildWithGrowthRecord: (data) => axiosClient.post('/Children/with-growth-record', data),
  updateGrowthRecord: (childId, data) => axiosClient.post(`/GrowthRecords/${childId}`, data),
  getHeightStandard: (gender, ageInDays) => axiosClient.get(`/GrowthStandard/height?gender=${gender}&ageInDays=${ageInDays}`),
  getWeightStandard: (gender, ageInDays) => axiosClient.get(`/GrowthStandard/weight?gender=${gender}&ageInDays=${ageInDays}`),
  getHeadCircumferenceStandard: (gender, ageInDays) => axiosClient.get(`/GrowthStandard/head-circumference?gender=${gender}&ageInDays=${ageInDays}`),
  getBMIStandard: (gender, ageInDays) => axiosClient.get(`/GrowthStandard/bmi?gender=${gender}&ageInDays=${ageInDays}`),
  getDailyRecordsByChildId: (childId) => axiosClient.get(`/DailyRecords/child/${childId}`),
  createDailyRecord: (data) => axiosClient.post('/DailyRecords', data),
  updateDailyRecord: (dailyRecordId, data) => axiosClient.put(`/DailyRecords/${dailyRecordId}`, data),
  deleteDailyRecord: (dailyRecordId) => axiosClient.delete(`/DailyRecords/${dailyRecordId}`),
  getGrowthPrediction: (childId, period = '1week') => axiosClient.get(`/GrowthAssessment/child/${childId}/prediction?period=${period}`),
  updateChild: (childId, data) => axiosClient.put(`/Children/${childId}`, data),
};

export default childrenApi;
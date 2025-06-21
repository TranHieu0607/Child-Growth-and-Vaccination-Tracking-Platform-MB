import axiosClient from './axiosClient';

const childrenApi = {
  getMyChildren: () => axiosClient.get('/Children/my-children'),
  deleteChild: (childId) => axiosClient.delete(`/Children/${childId}`),
  getChildById: (childId) => axiosClient.get(`/Children/${childId}`),
  getGrowthRecordsByChildId: (childId) => axiosClient.get(`/GrowthRecords/child/${childId}`),
  getLatestGrowthAssessment: (childId) => axiosClient.get(`/GrowthAssessment/child/${childId}/latest`),
  createChildWithGrowthRecord: (data) => axiosClient.post('/Children/with-growth-record', data),
  updateGrowthRecord: (childId, data) => axiosClient.post(`/GrowthRecords/${childId}`, data),
  getHeightStandard: (gender, ageInMonths) => axiosClient.get(`/GrowthStandard/height?gender=${gender}&ageInMonths=${ageInMonths}`),
  getWeightStandard: (gender, ageInMonths) => axiosClient.get(`/GrowthStandard/weight?gender=${gender}&ageInMonths=${ageInMonths}`),
  getHeadCircumferenceStandard: (gender, ageInMonths) => axiosClient.get(`/GrowthStandard/head-circumference?gender=${gender}&ageInMonths=${ageInMonths}`),
  getBMIStandard: (gender, ageInMonths) => axiosClient.get(`/GrowthStandard/bmi?gender=${gender}&ageInMonths=${ageInMonths}`),
};

export default childrenApi; 
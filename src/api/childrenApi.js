import axiosClient from './axiosClient';

const childrenApi = {
  getMyChildren: () => axiosClient.get('/Children/my-children'),
  deleteChild: (childId) => axiosClient.delete(`/Children/${childId}`),
  getChildById: (childId) => axiosClient.get(`/Children/${childId}`),
  createChildWithGrowthRecord: (data) => axiosClient.post('/Children/with-growth-record', data),
  updateGrowthRecord: (childId, data) => axiosClient.post(`/GrowthRecords/${childId}`, data),
};

export default childrenApi; 
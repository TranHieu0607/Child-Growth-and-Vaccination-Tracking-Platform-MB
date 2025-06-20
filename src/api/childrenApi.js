import axiosClient from './axiosClient';

const childrenApi = {
  getMyChildren: () => axiosClient.get('/Children/my-children'),
  deleteChild: (childId) => axiosClient.delete(`/Children/${childId}`),
  getChildById: (childId) => axiosClient.get(`/Children/${childId}`),
};

export default childrenApi; 
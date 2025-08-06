import axiosClient from './axiosClient';

const childVaccineProfileApi = {
  createProfile: (data) => axiosClient.post('/ChildVaccineProfiles', data),
  getByChildId: (childId) => axiosClient.get(`/ChildVaccineProfiles/public/child/${childId}`),
};

export default childVaccineProfileApi; 
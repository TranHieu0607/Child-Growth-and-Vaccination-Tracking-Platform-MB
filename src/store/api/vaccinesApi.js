import axiosClient from './axiosClient';

const vaccinesApi = {
  getAllVaccines: async () => {
    return axiosClient.get('/Vaccines');
  },
  getFacilityVaccines: (facilityId, token) => {
    return axiosClient.get(
      `/FacilityVaccines?facilityId=${facilityId}`,
      {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
};

export default vaccinesApi; 
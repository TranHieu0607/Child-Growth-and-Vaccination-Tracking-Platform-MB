import axiosClient from './axiosClient';

const vaccinesApi = {
  getAllVaccines: async () => {
    return axiosClient.get('/Vaccines');
  },
  getAllFacilityVaccines: (token) => {
    return axiosClient.get('/FacilityVaccines', {
      headers: {
        'accept': '*/*',
        'Authorization': token,
      }
    });
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
  // API mới: Lấy tất cả cơ sở có vaccine cụ thể
  getFacilitiesByVaccine: (vaccineId, token) => {
    return axiosClient.get(
      `/FacilityVaccines/by-vaccine/${vaccineId}`,
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
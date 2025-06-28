import axiosClient from './axiosClient';

const vaccinesApi = {
  getAllVaccines: () => axiosClient.get('/Vaccines'),
};

export default vaccinesApi; 
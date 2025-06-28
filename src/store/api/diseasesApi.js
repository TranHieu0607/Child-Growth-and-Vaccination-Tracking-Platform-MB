import axiosClient from './axiosClient';

const diseasesApi = {
  getAllDiseases: () => axiosClient.get('/Diseases'),
};

export default diseasesApi; 
import axiosClient from './axiosClient';

const surveyApi = {
  getSurveyResponses: (appointmentId, pageIndex = 1, pageSize = 10, token) => {
    return axiosClient.get(
      `/Survey/${appointmentId}/responses?pageIndex=${pageIndex}&pageSize=${pageSize}`,
      {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
};

export default surveyApi;



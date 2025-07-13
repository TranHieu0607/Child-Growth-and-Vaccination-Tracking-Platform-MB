import axiosClient from './axiosClient';

const appointmentApi = {
  getMyAppointmentHistory: (childId, token) => {
    return axiosClient.get(
      `/AppointmentBooking/my-history?childId=${childId}`,
      {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
};

export default appointmentApi; 
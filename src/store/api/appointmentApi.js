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
  cancelAppointment: (appointmentId, note, token) => {
    return axiosClient.delete(
      `/AppointmentBooking/${appointmentId}/cancel`,
      {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: note,
      }
    );
  },
};

export default appointmentApi; 
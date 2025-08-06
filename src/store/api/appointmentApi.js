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
  getAvailableSlots: (facilityId, date, token) => {
    return axiosClient.get(
      `/AppointmentBooking/available-slots?facilityId=${facilityId}&date=${date}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  createAppointment: (appointmentData, token) => {
    return axiosClient.post(
      `/AppointmentBooking`,
      appointmentData,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
  },
};

export default appointmentApi; 
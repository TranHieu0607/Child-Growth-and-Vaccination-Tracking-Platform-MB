import axiosClient from './axiosClient';

const bookingApi = {
  bookAppointment: (data, token) => {
    return axiosClient.post(
      '/AppointmentBooking/book',
      data,
      {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
  },
};

export default bookingApi; 
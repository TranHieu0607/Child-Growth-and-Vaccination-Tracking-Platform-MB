import axios from 'axios';
import axiosClient from './axiosClient';

const rebookApi = {
  // Rebook appointment
  rebookAppointment: (rebookData, token) => {

 
    // Tạo instance mới với token specific cho request này
    const customAxios = axios.create({
      baseURL: axiosClient.defaults.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return customAxios.post('/AppointmentBooking/rebook', rebookData);
  }
};

export default rebookApi;

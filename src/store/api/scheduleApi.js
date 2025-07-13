import axiosClient from './axiosClient';

const scheduleApi = {
  getFacilitySchedules: (facilityId, fromDate, toDate, token) => {
    return axiosClient.get(
      `/AppointmentBooking/facilities/${facilityId}/schedules?fromDate=${fromDate}&toDate=${toDate}`,
      {
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  }
};

export default scheduleApi; 
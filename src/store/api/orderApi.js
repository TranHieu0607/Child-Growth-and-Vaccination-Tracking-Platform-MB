import axiosClient from './axiosClient';

const orderApi = {
  getMyOrders: (pageIndex = 1, pageSize = 10, token) => {
    return axiosClient.get(`/Order/my-orders?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
      headers: {
        'accept': '*/*',
        'Authorization': token,
      }
    });
  },
  
  getOrderById: (orderId, token) => {
    return axiosClient.get(`/Order/${orderId}`, {
      headers: {
        'accept': '*/*',
        'Authorization': token,
      }
    });
  },

  createOrder: (packageItem, token, note) => {
    const selectedVaccines = packageItem.packageVaccines.map(pv => ({
      diseaseId: pv.diseaseId,
      facilityVaccineId: pv.facilityVaccineId,
      quantity: pv.quantity,
    }));
    const payload = {
      packageId: packageItem.packageId,
      selectedVaccines,
      orderDate: new Date().toISOString(),
      status: 'Pending',
      note,
    };
    
    return axiosClient.post('/Order/package', payload, {
      headers: {
        'accept': '*/*',
        'Authorization': token,
        'Content-Type': 'application/json',
      }
    });
  },
};

export default orderApi;

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
};

export default orderApi;

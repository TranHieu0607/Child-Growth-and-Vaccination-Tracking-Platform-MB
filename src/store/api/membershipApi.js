import axiosClient from './axiosClient';

/**
 * Lấy danh sách các gói thành viên đang hoạt động
 * @returns {Promise<any>}
 */
export async function getActiveMemberships() {
  const res = await axiosClient.get('/Memberships/active');
  return res.data;
}

/**
 * Tạo payment cho đăng ký VIP
 * @param {number} accountId
 * @param {number} membershipId
 * @param {string} token
 * @returns {Promise<{paymentUrl: string, orderId: string}>}
 */
export async function createPayment(accountId, membershipId, token) {
  const res = await axiosClient.post(
    '/Payment/create',
    { accountId, membershipId },
    {
      headers: {
        'accept': 'text/plain',
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  return {
    paymentUrl: res.data.data.paymentUrl,
    orderId: res.data.data.orderId,
  };
}

const membershipApi = {
  getActiveMemberships,
  createPayment,
};

export default membershipApi; 
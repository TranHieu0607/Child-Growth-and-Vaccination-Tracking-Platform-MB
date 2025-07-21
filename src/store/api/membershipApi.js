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
 * Đăng ký gói VIP cho user
 * @param {number} membershipId
 * @param {string} token
 * @returns {Promise<any>}
 */
export async function subscribeVip(membershipId, token) {
  const res = await axiosClient.post(
    '/UserMemberships/subscribe',
    { membershipId },
    {
      headers: {
        'accept': '*/*',
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data;
}

const membershipApi = {
  getActiveMemberships,
};

membershipApi.subscribeVip = subscribeVip;

export default membershipApi; 
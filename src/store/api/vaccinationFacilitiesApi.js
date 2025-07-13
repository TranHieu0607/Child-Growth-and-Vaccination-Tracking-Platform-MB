import axiosClient from './axiosClient';

/**
 * Lấy danh sách cơ sở tiêm chủng
 * @param {number} pageIndex - Trang hiện tại (bắt đầu từ 1)
 * @param {number} pageSize - Số lượng item trên mỗi trang
 * @returns {Promise<any>}
 */
export async function getVaccinationFacilities(pageIndex = 1, pageSize = 10) {
  const res = await axiosClient.get(`/VaccinationFacilities?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  return res.data;
}

/**
 * Lấy chi tiết cơ sở tiêm chủng theo ID
 * @param {number} facilityId
 * @returns {Promise<any>}
 */
export async function getVaccinationFacilityById(facilityId) {
  const res = await axiosClient.get(`/VaccinationFacilities/${facilityId}`);
  return res.data;
}

const vaccinationFacilitiesApi = {
  getVaccinationFacilities,
  getVaccinationFacilityById,
};

export default vaccinationFacilitiesApi; 
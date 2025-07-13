import axiosClient from './axiosClient';

/**
 * Lấy danh sách tất cả vaccine package
 * @returns {Promise<any>}
 */
export async function getAllVaccinePackages() {
  const res = await axiosClient.get('/VaccinePackages');
  return res.data;
}

const vaccinePackagesApi = {
  getAllVaccinePackages,
};

export default vaccinePackagesApi; 
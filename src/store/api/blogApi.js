import axiosClient from './axiosClient';

const blogApi = {
  // Lấy danh sách tất cả blog
  getAllBlogs: () => {
    const url = '/Blog';
    return axiosClient.get(url);
  },

  // Lấy blog theo ID
  getBlogById: (id) => {
    const url = `/Blog/${id}`;
    return axiosClient.get(url);
  },

  // Lấy blog theo category
  getBlogsByCategory: (category) => {
    const url = `/Blog?category=${category}`;
    return axiosClient.get(url);
  }
};

export default blogApi;

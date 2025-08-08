import { useState, useEffect } from 'react';
import blogApi from '../api/blogApi';

const useBlogs = (category = null) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (category) {
        response = await blogApi.getBlogsByCategory(category);
      } else {
        response = await blogApi.getAllBlogs();
      }
      
      // Kiểm tra cấu trúc response từ API
      console.log('API Response:', response);
      
      // API trả về { totalCount: number, data: [] }
      if (response && response.data && Array.isArray(response.data.data)) {
        setBlogs(response.data.data);
      } else if (response && response.data && Array.isArray(response.data)) {
        setBlogs(response.data);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching blogs:', err);
      setBlogs([]); // Đảm bảo blogs luôn là array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [category]);

  const refetch = () => {
    fetchBlogs();
  };

  return {
    blogs,
    loading,
    error,
    refetch
  };
};

export default useBlogs;

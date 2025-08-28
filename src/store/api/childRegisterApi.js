// store/api/childRegisterApi.js
import axiosClient from './axiosClient';

/**
 * Gọi API tạo trẻ + bản ghi tăng trưởng (multipart/form-data).
 * Nhận vào FormData đã được chuẩn bị sẵn ở Register.js.
 * Lưu ý: KHÔNG append 'Image' nếu không có ảnh.
 */
export async function registerChildWithGrowth(formData) {
  const res = await axiosClient.post('/Children/with-growth-record', formData, {
    transformRequest: [(data, headers) => data],
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: '*/*',
    },
  });

  // axiosClient trả về object { data, status, ... }
  return res.data;
}

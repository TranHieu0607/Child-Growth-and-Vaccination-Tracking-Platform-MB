import axiosClient from './axiosClient';
import { Platform } from 'react-native';

const childrenApi = {
  getMyChildren: () => axiosClient.get('/Children/my-children'),
  deleteChild: (childId) => axiosClient.delete(`/Children/${childId}`),
  getChildById: async (childId) => {
    const response = await axiosClient.get(`/Children/${childId}`);
    return response;
  },
  getGrowthRecordsByChildId: (childId) => axiosClient.get(`/GrowthRecords/child/${childId}`),
  getLatestGrowthAssessment: (childId) => axiosClient.get(`/GrowthAssessment/child/${childId}/latest`),
  createChildWithGrowthRecord: (data) => axiosClient.post('/Children/with-growth-record', data),
  updateGrowthRecord: (childId, data) => axiosClient.post(`/GrowthRecords/${childId}`, data),
  getHeightStandard: (gender, ageInDays) => axiosClient.get(`/GrowthStandard/height?gender=${gender}&ageInDays=${ageInDays}`),
  getWeightStandard: (gender, ageInDays) => axiosClient.get(`/GrowthStandard/weight?gender=${gender}&ageInDays=${ageInDays}`),
  getHeadCircumferenceStandard: (gender, ageInDays) => axiosClient.get(`/GrowthStandard/head-circumference?gender=${gender}&ageInDays=${ageInDays}`),
  getBMIStandard: (gender, ageInDays) => axiosClient.get(`/GrowthStandard/bmi?gender=${gender}&ageInDays=${ageInDays}`),
  getDailyRecordsByChildId: (childId) => axiosClient.get(`/DailyRecords/child/${childId}`),
  createDailyRecord: (data) => axiosClient.post('/DailyRecords', data),
  updateDailyRecord: (dailyRecordId, data) => axiosClient.put(`/DailyRecords/${dailyRecordId}`, data),
  deleteDailyRecord: (dailyRecordId) => axiosClient.delete(`/DailyRecords/${dailyRecordId}`),
  getGrowthPrediction: (childId, period = '1week') => axiosClient.get(`/GrowthAssessment/child/${childId}/prediction?period=${period}`),
  updateChild: (childId, data) => {
    const form = new FormData();
    
    if (data?.fullName != null) form.append('FullName', data.fullName);
    if (data?.birthDate != null) form.append('BirthDate', data.birthDate);
    if (data?.gender != null) form.append('Gender', data.gender);
    if (data?.bloodType != null) form.append('BloodType', data.bloodType);
    if (data?.allergiesNotes != null) form.append('AllergiesNotes', data.allergiesNotes);
    if (data?.medicalHistory != null) form.append('MedicalHistory', data.medicalHistory);
    if (data?.status != null) form.append('Status', data.status);

    return axiosClient.put(`/Children/${childId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  /**
   * Cập nhật thông tin trẻ em với ảnh (multipart)
   * @param {number} childId - ID của trẻ em
   * @param {{ fullName?: string, birthDate?: string, gender?: string, bloodType?: string, allergiesNotes?: string, medicalHistory?: string, image?: { uri: string, fileName?: string, type?: string } }} payload
   * @returns {Promise<any>}
   */
  updateChildWithImage: async (childId, payload) => {
    const form = new FormData();
    
    if (payload?.fullName != null) form.append('FullName', payload.fullName);
    if (payload?.birthDate != null) form.append('BirthDate', payload.birthDate);
    if (payload?.gender != null) form.append('Gender', payload.gender);
    if (payload?.bloodType != null) form.append('BloodType', payload.bloodType);
    if (payload?.allergiesNotes != null) form.append('AllergiesNotes', payload.allergiesNotes);
    if (payload?.medicalHistory != null) form.append('MedicalHistory', payload.medicalHistory);
    if (payload?.status != null) form.append('Status', payload.status);

    const image = payload?.image;
    if (image?.uri) {
      const imageUri = Platform.OS === 'ios'
        ? (image.uri.startsWith('file://') ? image.uri.replace('file://', '') : image.uri)
        : image.uri; // Keep file:// on Android
      form.append('Image', {
        uri: imageUri,
        name: image.fileName || `child_${Date.now()}.jpg`,
        type: image.type || 'image/jpeg',
      });
    }

    const response = await axiosClient.put(`/Children/${childId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default childrenApi;
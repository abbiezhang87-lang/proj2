import api from './axiosInstance';

export const getMyVisaStatus = () => api.get('/visa/me');
export const uploadNextDocument = (_formData) =>
  api.post('/visa/me/documents', _formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

import api from './axiosInstance';

export const getMyApplication = () => api.get('/onboarding/me');
export const submitApplication = (_payload) => api.post('/onboarding/submit', _payload);
export const uploadDocument = (_formData) =>
  api.post('/onboarding/documents', _formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

import api from './axiosInstance';

export const getMyProfile = () => api.get('/employees/me');
export const updateSection = (_section, _payload) =>
  api.patch(`/employees/me/${_section}`, _payload);
export const listMyDocuments = () => api.get('/employees/me/documents');
export const getDocumentUrl = (_id) => `/employees/me/documents/${_id}`;

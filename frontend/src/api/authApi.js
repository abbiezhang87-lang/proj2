import api from './axiosInstance';

export const login = (_payload) => api.post('/auth/login', _payload);
export const register = (_payload) => api.post('/auth/register', _payload);
export const getCurrentUser = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

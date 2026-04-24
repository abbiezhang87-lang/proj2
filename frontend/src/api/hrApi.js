import api from './axiosInstance';

// Employee Profiles
export const listEmployees = (_params) => api.get('/hr/employees', { params: _params });
export const getEmployeeProfile = (_id) => api.get(`/hr/employees/${_id}`);

// Hiring Management — registration tokens
export const generateToken = (_payload) => api.post('/hr/tokens', _payload);
export const listTokenHistory = () => api.get('/hr/tokens');

// Hiring Management — onboarding review
export const listApplications = (_status) =>
  api.get('/hr/applications', { params: { status: _status } });
export const reviewApplication = (_id, _payload) =>
  api.post(`/hr/applications/${_id}/review`, _payload);

// Visa
export const listVisaInProgress = () => api.get('/hr/visa/in-progress');
export const listVisaAll = (_params) => api.get('/hr/visa/all', { params: _params });
export const reviewVisaDocument = (_userId, _step, _payload) =>
  api.post(`/hr/visa/${_userId}/${_step}/review`, _payload);
export const sendNextStepNotification = (_userId) =>
  api.post(`/hr/visa/${_userId}/notify`);

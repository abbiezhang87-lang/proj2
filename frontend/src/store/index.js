import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import onboardingReducer from './slices/onboardingSlice';
import visaReducer from './slices/visaSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    onboarding: onboardingReducer,
    visa: visaReducer,
  },
});

export default store;

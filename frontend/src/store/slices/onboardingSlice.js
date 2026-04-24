import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  application: null,     // full app doc (status + fields)
  status: 'idle',
  error: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {},
});

export default onboardingSlice.reducer;

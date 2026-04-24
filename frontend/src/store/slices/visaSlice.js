import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  visaStatus: null,      // OPT step machine state
  status: 'idle',
  error: null,
};

const visaSlice = createSlice({
  name: 'visa',
  initialState,
  reducers: {},
});

export default visaSlice.reducer;

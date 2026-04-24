import { createSlice } from '@reduxjs/toolkit';

// Employee personal-information page state.
// HR employee-profile list state also lives here (or split into hrSlice later).
const initialState = {
  profile: null,
  documents: [],
  // HR views
  employees: [],
  status: 'idle',
  error: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {},
});

export default employeeSlice.reducer;

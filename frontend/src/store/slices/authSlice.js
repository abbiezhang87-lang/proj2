import { createSlice } from '@reduxjs/toolkit';

// TODO: async thunks for login, register, fetchCurrentUser, logout
const initialState = {
  user: null,        // { id, username, email, role: 'employee' | 'hr' }
  token: null,       // JWT
  status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // logout(state) { state.user = null; state.token = null; },
  },
  // extraReducers: (builder) => { /* TODO: handle thunk lifecycle */ },
});

export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';
import { setToken, clearToken, getToken } from '../../api/axiosInstance';

// --- Thunks ---

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login({ username, password });
      setToken(data.token);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(payload);
      setToken(data.token);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// Called on app boot if a token exists in localStorage — restores the session.
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_arg, { rejectWithValue }) => {
    try {
      const { data } = await authApi.getCurrentUser();
      return data.user;
    } catch (err) {
      clearToken();
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch (_e) {
    // Stateless JWT — ignore network errors on logout.
  }
  clearToken();
});

// --- Slice ---

const initialState = {
  user: null,
  status: getToken() ? 'loading' : 'idle', // 'loading' on boot if token exists
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload;
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload;
      })
      // register
      .addCase(register.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload;
      })
      .addCase(register.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload;
      })
      // fetchCurrentUser (session restore)
      .addCase(fetchCurrentUser.pending, (s) => {
        s.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.status = 'idle';
        s.user = null;
      })
      // logout
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.status = 'idle';
        s.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectRole = (state) => state.auth.user?.role || null;

export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as onboardingApi from '../../api/onboardingApi';

export const fetchMyApplication = createAsyncThunk(
  'onboarding/fetch',
  async (_arg, { rejectWithValue }) => {
    try {
      const { data } = await onboardingApi.getMyApplication();
      return data; // { application, status }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load application');
    }
  }
);

export const submitApplication = createAsyncThunk(
  'onboarding/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await onboardingApi.submitApplication(payload);
      return data.application;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Submission failed');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'onboarding/upload',
  async ({ file, kind }, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', kind);
      const { data } = await onboardingApi.uploadDocument(fd);
      return data.document;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

const initialState = {
  application: null,         // full doc (with populated documents)
  status: 'not_submitted',   // 'not_submitted' | 'pending' | 'approved' | 'rejected'
  loading: 'idle',           // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplication.pending, (s) => {
        s.loading = 'loading';
      })
      .addCase(fetchMyApplication.fulfilled, (s, a) => {
        s.loading = 'succeeded';
        s.application = a.payload.application;
        s.status = a.payload.status;
      })
      .addCase(fetchMyApplication.rejected, (s, a) => {
        s.loading = 'failed';
        s.error = a.payload;
      })
      .addCase(submitApplication.pending, (s) => {
        s.loading = 'loading';
        s.error = null;
      })
      .addCase(submitApplication.fulfilled, (s, a) => {
        s.loading = 'succeeded';
        s.application = a.payload;
        s.status = a.payload.status;
      })
      .addCase(submitApplication.rejected, (s, a) => {
        s.loading = 'failed';
        s.error = a.payload;
      })
      .addCase(uploadDocument.fulfilled, (s, a) => {
        // Append to local documents array so the UI updates without a refetch.
        if (s.application) {
          if (a.payload.kind === 'profile_picture') {
            s.application.profilePicture = a.payload;
          } else {
            s.application.documents = [...(s.application.documents || []), a.payload];
          }
        }
      });
  },
});

export const { clearError } = onboardingSlice.actions;

export const selectApplication = (state) => state.onboarding.application;
export const selectOnboardingStatus = (state) => state.onboarding.status;
export const selectOnboardingLoading = (state) => state.onboarding.loading;
export const selectOnboardingError = (state) => state.onboarding.error;

export default onboardingSlice.reducer;

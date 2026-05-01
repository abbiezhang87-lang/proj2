import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as visaApi from '../../api/visaApi';

export const fetchMyVisaStatus = createAsyncThunk(
  'visa/fetchMine',
  async (_arg, { rejectWithValue }) => {
    try {
      const { data } = await visaApi.getMyVisaStatus();
      return data; // { visaStatus, nextStep }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load visa status');
    }
  }
);

export const uploadNextVisaDocument = createAsyncThunk(
  'visa/uploadNext',
  async (file, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await visaApi.uploadNextDocument(fd);
      return data; // { visaStatus, document, step }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

const initialState = {
  visaStatus: null,
  nextStep: null,
  loading: 'idle',
  error: null,
};

const visaSlice = createSlice({
  name: 'visa',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVisaStatus.pending, (s) => { s.loading = 'loading'; })
      .addCase(fetchMyVisaStatus.fulfilled, (s, a) => {
        s.loading = 'succeeded';
        s.visaStatus = a.payload.visaStatus;
        s.nextStep = a.payload.nextStep;
      })
      .addCase(fetchMyVisaStatus.rejected, (s, a) => {
        s.loading = 'failed';
        s.error = a.payload;
      })
      .addCase(uploadNextVisaDocument.fulfilled, (s, a) => {
        s.visaStatus = a.payload.visaStatus;
        // nextStep won't change until HR approves the just-uploaded one.
      })
      .addCase(uploadNextVisaDocument.rejected, (s, a) => {
        s.error = a.payload;
      });
  },
});

export const { clearError } = visaSlice.actions;

export const selectVisaStatus = (state) => state.visa.visaStatus;
export const selectVisaNextStep = (state) => state.visa.nextStep;
export const selectVisaLoading = (state) => state.visa.loading;
export const selectVisaError = (state) => state.visa.error;

export default visaSlice.reducer;

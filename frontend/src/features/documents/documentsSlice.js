import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { fetchCsrfToken } from '../../api/axiosInstance';

// ─── Async thunks ──────────────────────────────────────────────────────────────

export const checkDocumentServiceStatus = createAsyncThunk(
  'documents/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/documents/status');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Service unavailable'
      );
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (file, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Upload failed'
      );
    }
  }
);

export const registerOrgUser = createAsyncThunk(
  'documents/registerOrgUser',
  async (orgUserDto, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.post('/admin/register-user', orgUserDto);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to register user'
      );
    }
  }
);

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  serviceStatus: null,
  statusLoading: false,
  uploadedFile: null,
  uploadLoading: false,
  uploadError: null,
  uploadSuccess: false,
  adminRegisterLoading: false,
  adminRegisterSuccess: false,
  adminRegisterError: null,
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearUploadState(state) {
      state.uploadedFile = null;
      state.uploadError = null;
      state.uploadSuccess = false;
    },
    clearAdminState(state) {
      state.adminRegisterSuccess = false;
      state.adminRegisterError = null;
    },
  },
  extraReducers: (builder) => {
    // Service status
    builder
      .addCase(checkDocumentServiceStatus.pending, (state) => {
        state.statusLoading = true;
        state.serviceStatus = null;
      })
      .addCase(checkDocumentServiceStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.serviceStatus = action.payload;
      })
      .addCase(checkDocumentServiceStatus.rejected, (state) => {
        state.statusLoading = false;
        state.serviceStatus = 'error';
      });

    // Upload
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
        state.uploadedFile = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;
        state.uploadedFile = action.payload;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload;
      });

    // Admin register user
    builder
      .addCase(registerOrgUser.pending, (state) => {
        state.adminRegisterLoading = true;
        state.adminRegisterError = null;
        state.adminRegisterSuccess = false;
      })
      .addCase(registerOrgUser.fulfilled, (state) => {
        state.adminRegisterLoading = false;
        state.adminRegisterSuccess = true;
      })
      .addCase(registerOrgUser.rejected, (state, action) => {
        state.adminRegisterLoading = false;
        state.adminRegisterError = action.payload;
      });
  },
});

export const { clearUploadState, clearAdminState } = documentsSlice.actions;
export default documentsSlice.reducer;

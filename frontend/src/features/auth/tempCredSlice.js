import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { fetchCsrfToken } from '../../api/axiosInstance';

// 1. Thunk to validate temporary credential (GET)
export const validateResetCredentials = createAsyncThunk(
  'tempCred/validateResetCredentials',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      // Axios automatically encodes params and appends them to the URL
      const response = await axiosInstance.get('/user/create/password', {
        params: {
          email: username,
          password: password
        }
      });
      
      // Since backend sends a boolean flag directly
      const isValid = response.data === true || response.data === 'true';
      
      if (!isValid) {
        return rejectWithValue('This temporary password is invalid or has expired.');
      }
      
      // Automatically triggers the .fulfilled case in extraReducers
      return isValid; 
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      return rejectWithValue(errorMsg || 'We could not verify this reset link. Please request a new one.');
    }
  }
);

// 2. Thunk to create / save new password (POST)
export const createNewPassword = createAsyncThunk(
  'tempCred/createNewPassword',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();

      const response = await axiosInstance.post('/user/create/password', {
        params: {
          email: username,
          password: password
        },
        username,
        password
      });
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      return rejectWithValue(errorMsg || 'We could not save your password. Please try again.');
    }
  }
);

const tempCredSlice = createSlice({
  name: 'tempCred',
  initialState: {
    resetChecking: true,
    validResetCredential: false,
    resetSubmitting: false,
    resetSuccessMessage: '',
    resetError: null,
  },
  reducers: {
    clearResetState: (state) => {
      state.resetChecking = true;
      state.validResetCredential = false;
      state.resetSubmitting = false;
      state.resetSuccessMessage = '';
      state.resetError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate credentials handlers
      .addCase(validateResetCredentials.pending, (state) => {
        state.resetChecking = true;
        state.resetError = null;
        state.validResetCredential = false;
      })
      .addCase(validateResetCredentials.fulfilled, (state) => {
        state.resetChecking = false;
        state.validResetCredential = true;
        state.resetError = null;
      })
      .addCase(validateResetCredentials.rejected, (state, action) => {
        state.resetChecking = false;
        state.validResetCredential = false;
        state.resetError = action.payload;
      })

      // Create new password handlers
      .addCase(createNewPassword.pending, (state) => {
        state.resetSubmitting = true;
        state.resetError = null;
        state.resetSuccessMessage = '';
      })
      .addCase(createNewPassword.fulfilled, (state, action) => {
        state.resetSubmitting = false;
        state.resetSuccessMessage = action.payload?.message || action.payload || 'Password updated successfully';
        state.resetError = null;
      })
      .addCase(createNewPassword.rejected, (state, action) => {
        state.resetSubmitting = false;
        state.resetError = action.payload;
      });
  },
});

export const { clearResetState } = tempCredSlice.actions;
export default tempCredSlice.reducer;
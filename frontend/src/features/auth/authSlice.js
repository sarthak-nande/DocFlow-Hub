import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { fetchCsrfToken } from '../../api/axiosInstance';

// ─── Async thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.post('/auth/login', { username, password });
      const token = response.data.Token || response.data.token;
      const uname = response.data.username;

      if (!token || !uname) {
        throw new Error('Login response did not include authentication details');
      }

      // Persist to localStorage
      localStorage.setItem('docflow_token', token);
      localStorage.setItem('docflow_user', uname);
      return { token, username: uname };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Login failed'
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.post('/auth/sign-up', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Registration failed'
      );
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'auth/fetchUserDetails',
  async (email, { rejectWithValue }) => {
    try {
      // ADD THIS LINE: Fetch CSRF token before making the POST request
      await fetchCsrfToken(); 
      
      const response = await axiosInstance.post('/user/userDetails', { email: email });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch user details'
      );
    }
  }
);

export const updateUserDetails = createAsyncThunk(
  'auth/updateUserDetails',
  async (userDto, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.post('/user/edit', userDto);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update user details'
      );
    }
  }
);

// ─── Initial state ─────────────────────────────────────────────────────────────

const storedToken = localStorage.getItem('docflow_token');
const storedUser = localStorage.getItem('docflow_user');

const initialState = {
  token: storedToken || null,
  username: storedUser || null,
  isAuthenticated: !!storedToken,
  user: null,
  loading: false,
  error: null,
  signupSuccess: false,
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.username = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      localStorage.removeItem('docflow_token');
      localStorage.removeItem('docflow_user');
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearSignupSuccess(state) {
      state.signupSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.signupSuccess = false;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        state.signupSuccess = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch user details
    builder
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.user = action.payload;
      });

    // Update user details
    builder
      .addCase(updateUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError, clearSignupSuccess } = authSlice.actions;
export default authSlice.reducer;

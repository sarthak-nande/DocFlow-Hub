import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { fetchCsrfToken } from '../../api/axiosInstance';

// ─── Existing Async Thunks ───────────────────────────────────────────────────

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

// ─── New Async Thunks for Organization Documents Page ───────────────────────

export const fetchOrgDocuments = createAsyncThunk(
  "documents/fetchOrgDocuments",
  async ({ page = 0, size = 10, search = "", status = "ALL" }, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.get("/documents/organization/all", {
        params: { page, size, search, status },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || "Failed to fetch organization documents"
      );
    }
  }
);

export const updateDocStatus = createAsyncThunk(
  "documents/updateStatus",
  async ({ documentId, status }, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.put(`/documents/status/${encodeURIComponent(documentId)}`, null, {
        params: { status },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || "Failed to update status"
      );
    }
  }
);

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  // Existing State
  serviceStatus: null,
  statusLoading: false,
  uploadedFile: null,
  uploadLoading: false,
  uploadError: null,
  uploadSuccess: false,
  adminRegisterLoading: false,
  adminRegisterSuccess: false,
  adminRegisterError: null,
  
  // New State for Organization Documents Table
  paginatedDocs: [],
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
  orgDocsLoading: false,
  statusUpdating: false,
  orgDocsError: null,
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
    clearOrgDocsError(state) {
      state.orgDocsError = null;
    }
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

    // Fetch Organization Documents (Paginated)
    builder
      .addCase(fetchOrgDocuments.pending, (state) => {
        state.orgDocsLoading = true;
        state.orgDocsError = null;
      })
      .addCase(fetchOrgDocuments.fulfilled, (state, action) => {
        state.orgDocsLoading = false;
        // Unwrap API response based on SuccessResponseDto structure
        const pageData = action.payload?.object || action.payload?.data || action.payload;
        
        state.paginatedDocs = pageData?.content || [];
        state.totalPages = pageData?.totalPages || 0;
        state.currentPage = pageData?.number || 0;
        state.totalElements = pageData?.totalElements || 0;
      })
      .addCase(fetchOrgDocuments.rejected, (state, action) => {
        state.orgDocsLoading = false;
        state.orgDocsError = action.payload;
        state.paginatedDocs = [];
      });

    // Update Document Status
    builder
      .addCase(updateDocStatus.pending, (state) => {
        state.statusUpdating = true;
        state.orgDocsError = null;
      })
      .addCase(updateDocStatus.fulfilled, (state, action) => {
        state.statusUpdating = false;
        const updatedDoc = action.payload?.object || action.payload?.data || action.payload;
        
        // Update the document inline without triggering a full refetch
        const index = state.paginatedDocs.findIndex(
          (doc) => (doc.id || doc._id) === (updatedDoc.id || updatedDoc._id)
        );
        if (index !== -1) {
          state.paginatedDocs[index] = updatedDoc;
        }
      })
      .addCase(updateDocStatus.rejected, (state, action) => {
        state.statusUpdating = false;
        state.orgDocsError = action.payload;
      });
  },
});

export const { clearUploadState, clearAdminState, clearOrgDocsError } = documentsSlice.actions;
export default documentsSlice.reducer;
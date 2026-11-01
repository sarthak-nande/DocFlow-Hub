import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { fetchCsrfToken } from '../../api/axiosInstance';

// ─── Async thunks ──────────────────────────────────────────────────────────────

export const fetchFolders = createAsyncThunk(
  'folders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.get('/folders/organization/all');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Failed to fetch folders'
      );
    }
  }
);

export const createFolder = createAsyncThunk(
  'folders/create',
  async ({ name, parentId = null }, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.post('/folders/create', { name, parentId });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Failed to create folder'
      );
    }
  }
);

export const renameFolder = createAsyncThunk(
  'folders/rename',
  async ({ folderId, newName }, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      const response = await axiosInstance.put('/folders/edit/name', { folderId, newName });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Failed to rename folder'
      );
    }
  }
);

export const deleteFolder = createAsyncThunk(
  'folders/delete',
  async (folderId, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      // Notice we pass the folderId dynamically in the path
      const response = await axiosInstance.delete(`/folders/delete/${encodeURIComponent(folderId)}`);
      // Return the folderId so we know which item to remove from the state
      return folderId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Failed to delete folder'
      );
    }
  }
);

export const uploadFiles = createAsyncThunk(
  'folders/uploadFiles',
  async ({ files, folderId = null }, { rejectWithValue, dispatch }) => {
    try {
      await fetchCsrfToken();
      const formData = new FormData();
      
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      
      if (folderId) {
        formData.append('folderId', folderId);
      }

      const response = await axiosInstance.post('/documents/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh folder list after a successful upload
      dispatch(fetchFolders());
      
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Failed to upload files'
      );
    }
  }
);

export const fetchDocuments = createAsyncThunk(
  'folders/fetchDocuments',
  async (folderId = null, { rejectWithValue }) => {
    try {
      await fetchCsrfToken();
      // Pass the folderId as a query parameter
      const response = await axiosInstance.get('/documents/folder', {
        params: { folderId }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Failed to fetch documents'
      );
    }
  }
);

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  documents: [], // <--- ADD THIS
  loading: false,
  docLoading: false, // <--- ADD THIS
  uploadLoading: false,
  error: null,
  uploadSuccess: false,
};
// ─── Slice ─────────────────────────────────────────────────────────────────────

const folderSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    clearFolderError(state) {
      state.error = null;
    },
    clearUploadSuccess(state) {
      state.uploadSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Folders
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false;
        // Unwrap API wrapper (SuccessResponseDto wraps payload in 'object' or 'data')
        const payload = action.payload?.object || action.payload?.data || action.payload;
        state.items = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      });

    // Create Folder
    builder
      .addCase(createFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload?.object || action.payload?.data || action.payload;
        if (payload) {
          state.items.push(payload);
        }
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Rename Folder
    builder
      .addCase(renameFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renameFolder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFolder = action.payload?.object || action.payload?.data || action.payload;
        const index = state.items.findIndex(
          (folder) => folder.id === updatedFolder?.id || folder.folderId === updatedFolder?.folderId
        );
        if (index !== -1) {
          state.items[index] = updatedFolder;
        }
      })
      .addCase(renameFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Folder
    builder
      .addCase(deleteFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is the folderId returned from our thunk
        state.items = state.items.filter(
          (folder) => folder.id !== action.payload && folder.folderId !== action.payload
        );
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Upload Files
    builder
      .addCase(uploadFiles.pending, (state) => {
        state.uploadLoading = true;
        state.uploadSuccess = false;
        state.error = null;
      })
      .addCase(uploadFiles.fulfilled, (state) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      });

      builder
      .addCase(fetchDocuments.pending, (state) => {
        state.docLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.docLoading = false;
        const payload = action.payload?.object || action.payload?.data || action.payload;
        state.documents = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.docLoading = false;
        state.error = action.payload;
        state.documents = [];
      });
  },
});

export const { clearFolderError, clearUploadSuccess } = folderSlice.actions;
export default folderSlice.reducer;
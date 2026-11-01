import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import documentsReducer from '../features/documents/documentsSlice';
import tempCredReducer from '../features/auth/tempCredSlice';
import folderReducer from '../features/auth/folderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
    tempCred: tempCredReducer,
    folders: folderReducer
  },
});

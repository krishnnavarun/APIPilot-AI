import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import projectReducer from './projectSlice.js';

const appReducer = (state = { initializedAt: Date.now() }) => state;

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    project: projectReducer,
  },
  devTools: import.meta.env.DEV,
});


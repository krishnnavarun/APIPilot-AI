import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';

const appReducer = (state = { initializedAt: Date.now() }) => state;

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
  },
  devTools: import.meta.env.DEV,
});

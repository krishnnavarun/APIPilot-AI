import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('authToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('authToken', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Register
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('authToken', action.payload.token);
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get current user
    getMeStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getMeSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    getMeFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('authToken');
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  getMeStart,
  getMeSuccess,
  getMeFailure,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;

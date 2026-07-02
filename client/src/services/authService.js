import axios from 'axios';
import { API_BASE } from './http';

const authService = {
  /**
   * Register a new user
   * @param {Object} credentials - { fullName, email, password, confirmPassword }
   * @returns {Promise} - { user, token }
   */
  register: async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, credentials);
      return response.data.user;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - { user, token }
   */
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  /**
   * Get current user profile
   * @param {String} token - JWT token
   * @returns {Promise} - user object
   */
  getMe: async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch user profile';
    }
  },

  /**
   * Logout user (client-side)
   */
  logout: () => {
    localStorage.removeItem('authToken');
  },

  /**
   * Get stored token
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default authService;

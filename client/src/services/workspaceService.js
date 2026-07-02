import axios from 'axios';
import authService from './authService';

const API_BASE = 'http://localhost:8080/api/v1';

const getAuthHeader = () => {
  const token = authService.getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

const workspaceService = {
  /**
   * Create a new workspace
   */
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/workspaces`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create workspace';
    }
  },

  /**
   * Get all user's workspaces
   */
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE}/workspaces`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch workspaces';
    }
  },

  /**
   * Get workspace by ID
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/workspaces/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch workspace';
    }
  },

  /**
   * Update workspace
   */
  update: async (id, data) => {
    try {
      const response = await axios.patch(`${API_BASE}/workspaces/${id}`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update workspace';
    }
  },

  /**
   * Delete workspace
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/workspaces/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete workspace';
    }
  },

  /**
   * Add member to workspace
   */
  addMember: async (id, userId, role = 'member') => {
    try {
      const response = await axios.post(
        `${API_BASE}/workspaces/${id}/members`,
        { userId, role },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to add member';
    }
  },

  /**
   * Remove member from workspace
   */
  removeMember: async (id, memberId) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/workspaces/${id}/members/${memberId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to remove member';
    }
  },
};

export default workspaceService;

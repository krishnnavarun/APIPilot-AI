import axios from 'axios';
import authService from './authService';

const API_BASE = 'http://localhost:8080/api/v1';

const getAuthHeader = () => {
  const token = authService.getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

const projectService = {
  /**
   * Create a new project
   */
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/projects`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create project';
    }
  },

  /**
   * Get projects in a workspace
   */
  getByWorkspace: async (workspaceId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/projects/workspace/${workspaceId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch projects';
    }
  },

  /**
   * Get project by ID
   */
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/projects/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch project';
    }
  },

  /**
   * Update project
   */
  update: async (id, data) => {
    try {
      const response = await axios.patch(`${API_BASE}/projects/${id}`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update project';
    }
  },

  /**
   * Delete project
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/projects/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete project';
    }
  },
};

export default projectService;

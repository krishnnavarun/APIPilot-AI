import axios from 'axios';
import authService from './authService';
import { API_BASE, authHeader } from './http';

const getAuthHeader = () => {
  return authHeader(authService.getToken());
};

const endpointService = {
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/endpoints`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create endpoint';
    }
  },

  getByProject: async (projectId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/endpoints/project/${projectId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch endpoints';
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/endpoints/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch endpoint';
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.patch(`${API_BASE}/endpoints/${id}`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update endpoint';
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/endpoints/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete endpoint';
    }
  },

  execute: async (id, data) => {
    try {
      const response = await axios.post(
        `${API_BASE}/endpoints/${id}/execute`,
        data,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to execute endpoint';
    }
  },
};

const testCaseService = {
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/tests`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create test case';
    }
  },

  getByProject: async (projectId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/tests/project/${projectId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch test cases';
    }
  },

  getByEndpoint: async (endpointId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/tests/endpoint/${endpointId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch test cases';
    }
  },

  run: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE}/tests/${id}/run`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to run test case';
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.patch(`${API_BASE}/tests/${id}`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update test case';
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/tests/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete test case';
    }
  },
};

const aiService = {
  generateTests: async (endpointId, projectId, count = 5) => {
    try {
      const response = await axios.post(
        `${API_BASE}/ai/generate-tests`,
        { endpointId, projectId, count },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate tests';
    }
  },

  generateMockData: async (endpointId) => {
    try {
      const response = await axios.post(
        `${API_BASE}/ai/generate-mock`,
        { endpointId },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate mock data';
    }
  },

  analyzeSecurity: async (projectId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/ai/security/${projectId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to analyze security';
    }
  },

  generateDocumentation: async (projectId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/ai/docs/${projectId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate documentation';
    }
  },
};

export { endpointService, testCaseService, aiService };

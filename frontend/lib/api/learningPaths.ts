import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const learningPathsApi = {
  getAll: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/learning-paths`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/learning-paths/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  enroll: async (id: string) => {
    const response = await axios.post(`${API_URL}/learning-paths/${id}/enroll`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMyPaths: async () => {
    const response = await axios.get(`${API_URL}/learning-paths/my-paths`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getProgress: async (id: string) => {
    const response = await axios.get(`${API_URL}/learning-paths/${id}/progress`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/learning-paths`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/learning-paths/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/learning-paths/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

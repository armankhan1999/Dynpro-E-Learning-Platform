import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const tagsApi = {
  getAll: async (skip = 0, limit = 50) => {
    const response = await axios.get(`${API_URL}/tags`, {
      params: { skip, limit }
    });
    return response.data;
  },

  create: async (name: string) => {
    const response = await axios.post(`${API_URL}/tags`, { name }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (tagId: string, name: string) => {
    const response = await axios.put(`${API_URL}/tags/${tagId}`, { name }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (tagId: string) => {
    const response = await axios.delete(`${API_URL}/tags/${tagId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  addToCourse: async (courseId: string, tagId: string) => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/tags/${tagId}`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  removeFromCourse: async (courseId: string, tagId: string) => {
    const response = await axios.delete(`${API_URL}/courses/${courseId}/tags/${tagId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

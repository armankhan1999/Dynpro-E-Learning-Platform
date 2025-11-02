import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const categoriesApi = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/categories/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/categories`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/categories/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/categories/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

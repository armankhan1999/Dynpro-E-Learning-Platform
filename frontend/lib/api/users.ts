import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const usersApi = {
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axios.put(`${API_URL}/users/me`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAll: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/users`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateSettings: async (settings: any) => {
    const response = await axios.put(`${API_URL}/settings/user`, settings, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

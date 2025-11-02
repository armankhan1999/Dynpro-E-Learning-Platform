import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const settingsApi = {
  getUserSettings: async () => {
    const response = await axios.get(`${API_URL}/settings/user`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateUserSettings: async (settings: any) => {
    const response = await axios.put(`${API_URL}/settings/user`, settings, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getPlatformSettings: async () => {
    const response = await axios.get(`${API_URL}/settings/platform`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updatePlatformSettings: async (settings: any) => {
    const response = await axios.put(`${API_URL}/settings/platform`, settings, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

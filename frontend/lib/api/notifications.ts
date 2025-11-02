import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const notificationsApi = {
  getAll: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/notifications`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getUnread: async () => {
    const response = await axios.get(`${API_URL}/notifications/unread`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await axios.put(`${API_URL}/notifications/${id}/read`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axios.put(`${API_URL}/notifications/mark-all-read`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getPreferences: async () => {
    const response = await axios.get(`${API_URL}/notifications/preferences`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updatePreferences: async (preferences: any) => {
    const response = await axios.put(`${API_URL}/notifications/preferences`, preferences, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

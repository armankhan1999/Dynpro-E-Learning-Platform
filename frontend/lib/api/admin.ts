import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const adminApi = {
  // User Management
  getAllUsers: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/admin/users`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await axios.put(`${API_URL}/admin/users/${userId}/role`, {
      role
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deactivateUser: async (userId: string) => {
    const response = await axios.post(`${API_URL}/admin/users/${userId}/deactivate`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // System Settings
  getSystemSettings: async () => {
    const response = await axios.get(`${API_URL}/settings/platform`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateSystemSettings: async (settings: any) => {
    const response = await axios.put(`${API_URL}/settings/platform`, settings, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Categories
  createCategory: async (data: any) => {
    const response = await axios.post(`${API_URL}/categories`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateCategory: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/categories/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await axios.delete(`${API_URL}/categories/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Announcements
  createAnnouncement: async (data: any) => {
    const response = await axios.post(`${API_URL}/announcements`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAnnouncements: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/announcements`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteAnnouncement: async (id: string) => {
    const response = await axios.delete(`${API_URL}/announcements/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (skip = 0, limit = 50) => {
    const response = await axios.get(`${API_URL}/admin/audit-logs`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  }
};

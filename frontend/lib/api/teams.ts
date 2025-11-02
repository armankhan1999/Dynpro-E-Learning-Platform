import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const teamsApi = {
  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/teams`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAll: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/teams`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/teams/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/teams/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/teams/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  addMember: async (teamId: string, userId: string, role = 'member') => {
    const response = await axios.post(`${API_URL}/teams/${teamId}/members`, {
      user_id: userId,
      role
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  removeMember: async (teamId: string, userId: string) => {
    const response = await axios.delete(`${API_URL}/teams/${teamId}/members/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMembers: async (teamId: string) => {
    const response = await axios.get(`${API_URL}/teams/${teamId}/members`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

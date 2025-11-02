import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const discussionsApi = {
  getAll: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/discussions`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/discussions/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/discussions`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  reply: async (id: string, content: string) => {
    const response = await axios.post(
      `${API_URL}/discussions/${id}/replies`,
      { content },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  upvote: async (id: string) => {
    const response = await axios.post(
      `${API_URL}/discussions/${id}/upvote`,
      null,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

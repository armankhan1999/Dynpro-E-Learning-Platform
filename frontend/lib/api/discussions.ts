import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const discussionsApi = {
  getAll: async (skip = 0, limit = 50) => {
    const response = await axios.get(`${API_URL}/discussions`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMyDiscussions: async () => {
    const response = await axios.get(`${API_URL}/discussions/my-discussions`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getTrending: async (days = 7) => {
    const response = await axios.get(`${API_URL}/discussions/trending`, {
      params: { days },
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

  update: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/discussions/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/discussions/${id}`, {
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

  getReplies: async (id: string) => {
    const response = await axios.get(
      `${API_URL}/discussions/${id}/replies`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  upvoteReply: async (discussionId: string, replyId: string) => {
    const response = await axios.post(
      `${API_URL}/discussions/${discussionId}/replies/${replyId}/upvote`,
      null,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  markSolution: async (discussionId: string, replyId: string) => {
    const response = await axios.post(
      `${API_URL}/discussions/${discussionId}/mark-solution`,
      null,
      {
        params: { reply_id: replyId },
        headers: getAuthHeader()
      }
    );
    return response.data;
  }
};

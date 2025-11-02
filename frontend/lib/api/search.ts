import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const searchApi = {
  searchCourses: async (query: string, filters?: any) => {
    const response = await axios.get(`${API_URL}/search/courses`, {
      params: { query, ...filters },
      headers: getAuthHeader()
    });
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await axios.get(`${API_URL}/search/users`, {
      params: { query },
      headers: getAuthHeader()
    });
    return response.data;
  },

  searchContent: async (query: string) => {
    const response = await axios.get(`${API_URL}/search/content`, {
      params: { query },
      headers: getAuthHeader()
    });
    return response.data;
  },

  globalSearch: async (query: string) => {
    const response = await axios.get(`${API_URL}/search/global`, {
      params: { query },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getSearchSuggestions: async (query: string) => {
    const response = await axios.get(`${API_URL}/search/suggestions`, {
      params: { query },
      headers: getAuthHeader()
    });
    return response.data;
  }
};

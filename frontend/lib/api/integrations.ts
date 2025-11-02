import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const integrationsApi = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/integrations`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  enable: async (integrationId: string, config: any) => {
    const response = await axios.post(`${API_URL}/integrations/${integrationId}/enable`, {
      config
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  disable: async (integrationId: string) => {
    const response = await axios.post(`${API_URL}/integrations/${integrationId}/disable`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getStatus: async (integrationId: string) => {
    const response = await axios.get(`${API_URL}/integrations/${integrationId}/status`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  test: async (integrationId: string) => {
    const response = await axios.post(`${API_URL}/integrations/${integrationId}/test`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

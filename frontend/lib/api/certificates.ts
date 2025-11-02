import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const certificatesApi = {
  getMyCertificates: async () => {
    const response = await axios.get(`${API_URL}/certificates/my-certificates`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/certificates/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  download: async (id: string) => {
    const response = await axios.get(`${API_URL}/certificates/${id}/download`, {
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    return response.data;
  },

  verify: async (code: string) => {
    const response = await axios.get(`${API_URL}/certificates/verify/${code}`);
    return response.data;
  },

  share: async (id: string) => {
    const response = await axios.post(`${API_URL}/certificates/${id}/share`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

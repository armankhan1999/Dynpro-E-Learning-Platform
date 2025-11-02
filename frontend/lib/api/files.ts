import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const filesApi = {
  upload: async (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }

    const response = await axios.post(`${API_URL}/files/upload`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/files/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  download: async (id: string) => {
    const response = await axios.get(`${API_URL}/files/${id}/download`, {
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/files/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMyFiles: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/files/my-files`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  }
};

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const assignmentsApi = {
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/assignments/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  submit: async (id: string, data: FormData) => {
    const response = await axios.post(
      `${API_URL}/assignments/${id}/submit`,
      data,
      { 
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  getSubmission: async (id: string) => {
    const response = await axios.get(`${API_URL}/assignments/${id}/submission`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

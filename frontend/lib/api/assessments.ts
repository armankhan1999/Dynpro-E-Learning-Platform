import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const assessmentsApi = {
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/assessments/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  submit: async (id: string, answers: any) => {
    const response = await axios.post(
      `${API_URL}/assessments/${id}/submit`,
      { answers },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getResults: async (id: string) => {
    const response = await axios.get(`${API_URL}/assessments/${id}/results`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

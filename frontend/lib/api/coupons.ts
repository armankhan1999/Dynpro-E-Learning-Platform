import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const couponsApi = {
  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/coupons`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  validate: async (code: string, courseId?: string) => {
    const response = await axios.post(`${API_URL}/coupons/validate`, {
      code,
      course_id: courseId
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  apply: async (code: string, courseId: string) => {
    const response = await axios.post(`${API_URL}/coupons/apply`, {
      code,
      course_id: courseId
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAll: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/coupons`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/coupons/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

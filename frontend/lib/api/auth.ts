import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await axios.post(`${API_URL}/auth/login`, formData);
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) => {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  logout: async (token: string) => {
    const response = await axios.post(`${API_URL}/auth/logout`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getCurrentUser: async (token: string) => {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      new_password: newPassword
    });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
    return response.data;
  }
};

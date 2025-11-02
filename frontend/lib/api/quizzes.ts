import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const quizzesApi = {
  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/quizzes`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/quizzes/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/quizzes/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/quizzes/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  addQuestion: async (quizId: string, question: any) => {
    const response = await axios.post(`${API_URL}/quizzes/${quizId}/questions`, question, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getQuestions: async (quizId: string) => {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}/questions`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  startAttempt: async (quizId: string) => {
    const response = await axios.post(`${API_URL}/quizzes/${quizId}/attempt`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  submitAttempt: async (attemptId: string, answers: any) => {
    const response = await axios.post(`${API_URL}/quizzes/attempts/${attemptId}/submit`, {
      answers
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getResults: async (quizId: string) => {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}/results`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

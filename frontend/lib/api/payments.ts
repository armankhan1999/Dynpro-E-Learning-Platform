import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const paymentsApi = {
  createIntent: async (courseId: string, amount: number) => {
    const response = await axios.post(`${API_URL}/payments/create-intent`, {
      course_id: courseId,
      amount
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string, paymentMethodId: string) => {
    const response = await axios.post(`${API_URL}/payments/confirm`, {
      payment_intent_id: paymentIntentId,
      payment_method_id: paymentMethodId
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getHistory: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/payments/history`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  requestRefund: async (paymentId: string, reason: string) => {
    const response = await axios.post(`${API_URL}/payments/refund`, {
      payment_id: paymentId,
      reason
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getDetails: async (paymentId: string) => {
    const response = await axios.get(`${API_URL}/payments/${paymentId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

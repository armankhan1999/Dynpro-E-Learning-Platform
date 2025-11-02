import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const subscriptionsApi = {
  create: async (planId: string, paymentMethodId: string) => {
    const response = await axios.post(`${API_URL}/subscriptions/create`, {
      plan_id: planId,
      payment_method_id: paymentMethodId
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getPlans: async () => {
    const response = await axios.get(`${API_URL}/subscriptions/plans`);
    return response.data;
  },

  getCurrent: async () => {
    const response = await axios.get(`${API_URL}/subscriptions/current`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  cancel: async (subscriptionId: string) => {
    const response = await axios.post(`${API_URL}/subscriptions/${subscriptionId}/cancel`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  resume: async (subscriptionId: string) => {
    const response = await axios.post(`${API_URL}/subscriptions/${subscriptionId}/resume`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

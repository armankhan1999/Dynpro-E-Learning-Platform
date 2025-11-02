import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const gamificationApi = {
  getMyBadges: async () => {
    const response = await axios.get(`${API_URL}/gamification/my-badges`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMyPoints: async () => {
    const response = await axios.get(`${API_URL}/gamification/my-points`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getLeaderboard: async (timeframe = 'all') => {
    const response = await axios.get(`${API_URL}/gamification/leaderboard`, {
      params: { timeframe },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAchievements: async () => {
    const response = await axios.get(`${API_URL}/gamification/achievements`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  claimReward: async (rewardId: string) => {
    const response = await axios.post(`${API_URL}/gamification/rewards/${rewardId}/claim`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getStreak: async () => {
    const response = await axios.get(`${API_URL}/gamification/streak`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const analyticsApi = {
  getUserAnalytics: async (userId: string) => {
    const response = await axios.get(`${API_URL}/analytics/user/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getCourseAnalytics: async (courseId: string) => {
    const response = await axios.get(`${API_URL}/analytics/course/${courseId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getPlatformAnalytics: async (startDate?: string, endDate?: string) => {
    const response = await axios.get(`${API_URL}/analytics/platform`, {
      params: { start_date: startDate, end_date: endDate },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getEngagementMetrics: async (period = 'week') => {
    const response = await axios.get(`${API_URL}/analytics/engagement`, {
      params: { period },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getRevenueAnalytics: async (startDate?: string, endDate?: string) => {
    const response = await axios.get(`${API_URL}/analytics/revenue`, {
      params: { start_date: startDate, end_date: endDate },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getTeamAnalytics: async (managerId?: string) => {
    const response = await axios.get(`${API_URL}/analytics/team`, {
      params: { manager_id: managerId },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getDepartmentAnalytics: async (departmentId: string) => {
    const response = await axios.get(`${API_URL}/analytics/department/${departmentId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

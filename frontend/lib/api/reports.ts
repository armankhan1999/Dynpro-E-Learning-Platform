import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const reportsApi = {
  getUserReport: async (userId: string, startDate?: string, endDate?: string) => {
    const response = await axios.get(`${API_URL}/reports/user/${userId}`, {
      params: { start_date: startDate, end_date: endDate },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getCourseReport: async (courseId: string) => {
    const response = await axios.get(`${API_URL}/reports/course/${courseId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getEnrollmentReport: async (startDate?: string, endDate?: string) => {
    const response = await axios.get(`${API_URL}/reports/enrollments`, {
      params: { start_date: startDate, end_date: endDate },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getCompletionReport: async () => {
    const response = await axios.get(`${API_URL}/reports/completion`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  exportReport: async (reportType: string, format = 'pdf') => {
    const response = await axios.get(`${API_URL}/reports/export`, {
      params: { report_type: reportType, format },
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    return response.data;
  },

  getDepartmentProgress: async (departmentId?: string) => {
    const response = await axios.get(`${API_URL}/reports/department-progress`, {
      params: { department_id: departmentId },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getTeamReport: async (managerId?: string) => {
    const response = await axios.get(`${API_URL}/reports/team`, {
      params: { manager_id: managerId },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getComplianceReport: async () => {
    const response = await axios.get(`${API_URL}/reports/compliance-status`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

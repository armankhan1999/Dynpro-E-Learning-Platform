import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const enrollmentsApi = {
  getMyEnrollments: async () => {
    const response = await axios.get(`${API_URL}/enrollments/my-courses`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  enroll: async (courseId: string) => {
    const response = await axios.post(`${API_URL}/enrollments`, 
      { course_id: courseId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getProgress: async (courseId: string) => {
    const response = await axios.get(`${API_URL}/progress/courses/${courseId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateProgress: async (courseId: string, moduleId: string, data: any) => {
    const response = await axios.post(
      `${API_URL}/progress/courses/${courseId}/update`,
      { module_id: moduleId, ...data },
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

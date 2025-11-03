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

  create: async (data: { course_id: string }) => {
    const response = await axios.post(`${API_URL}/enrollments`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  enroll: async (courseId: string) => {
    const response = await axios.post(`${API_URL}/enrollments`,
      { course_id: courseId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getProgress: async (enrollmentId: string) => {
    const response = await axios.get(`${API_URL}/enrollments/${enrollmentId}/progress`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateProgress: async (enrollmentId: string, data: any) => {
    const response = await axios.post(
      `${API_URL}/enrollments/${enrollmentId}/progress`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  markContentComplete: async (enrollmentId: string, contentItemId: string) => {
    const response = await axios.post(
      `${API_URL}/enrollments/${enrollmentId}/content/${contentItemId}/complete`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Notes API
  getNotes: async (enrollmentId: string, contentId: string) => {
    const response = await axios.get(
      `${API_URL}/enrollments/${enrollmentId}/notes`,
      {
        headers: getAuthHeader(),
        params: { content_id: contentId }
      }
    );
    return response.data;
  },

  addNote: async (enrollmentId: string, data: { content: string; content_id: string }) => {
    const response = await axios.post(
      `${API_URL}/enrollments/${enrollmentId}/notes`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  updateNote: async (enrollmentId: string, noteId: string, data: { content: string }) => {
    const response = await axios.put(
      `${API_URL}/enrollments/${enrollmentId}/notes/${noteId}`,
      data,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deleteNote: async (enrollmentId: string, noteId: string) => {
    const response = await axios.delete(
      `${API_URL}/enrollments/${enrollmentId}/notes/${noteId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

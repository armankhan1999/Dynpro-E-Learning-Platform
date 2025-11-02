import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const contentApi = {
  // Modules
  createModule: async (courseId: string, data: any) => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/modules`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getModules: async (courseId: string) => {
    const response = await axios.get(`${API_URL}/courses/${courseId}/modules`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateModule: async (moduleId: string, data: any) => {
    const response = await axios.put(`${API_URL}/modules/${moduleId}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteModule: async (moduleId: string) => {
    const response = await axios.delete(`${API_URL}/modules/${moduleId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Lessons
  createLesson: async (moduleId: string, data: any) => {
    const response = await axios.post(`${API_URL}/modules/${moduleId}/lessons`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getLessons: async (moduleId: string) => {
    const response = await axios.get(`${API_URL}/modules/${moduleId}/lessons`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateLesson: async (lessonId: string, data: any) => {
    const response = await axios.put(`${API_URL}/lessons/${lessonId}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteLesson: async (lessonId: string) => {
    const response = await axios.delete(`${API_URL}/lessons/${lessonId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  markLessonComplete: async (lessonId: string) => {
    const response = await axios.post(`${API_URL}/lessons/${lessonId}/complete`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getContent: async (contentId: string) => {
    const response = await axios.get(`${API_URL}/content/${contentId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  uploadContent: async (file: File, title?: string, contentType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (contentType) formData.append('content_type', contentType);

    const response = await axios.post(`${API_URL}/content/upload`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

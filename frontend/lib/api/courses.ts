import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const coursesApi = {
  getAll: async (skip = 0, limit = 20, filters?: { status?: string }) => {
    const response = await axios.get(`${API_URL}/courses`, {
      params: { skip, limit, ...filters },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMyCourses: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/courses/my-courses`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/courses/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/courses`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/courses/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/courses/${id}`, {
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

  getModules: async (courseId: string) => {
    const response = await axios.get(`${API_URL}/courses/${courseId}/modules`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createModule: async (courseId: string, data: any) => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/modules`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateModule: async (courseId: string, moduleId: string, data: any) => {
    const response = await axios.put(`${API_URL}/courses/${courseId}/modules/${moduleId}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteModule: async (courseId: string, moduleId: string) => {
    const response = await axios.delete(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  addContentItem: async (courseId: string, moduleId: string, data: any) => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/modules/${moduleId}/content`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateContentItem: async (courseId: string, moduleId: string, contentId: string, data: any) => {
    const response = await axios.put(`${API_URL}/courses/${courseId}/modules/${moduleId}/content/${contentId}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteContentItem: async (courseId: string, moduleId: string, contentId: string) => {
    const response = await axios.delete(`${API_URL}/courses/${courseId}/modules/${moduleId}/content/${contentId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  search: async (query: string) => {
    const response = await axios.get(`${API_URL}/search/courses`, {
      params: { query },
      headers: getAuthHeader()
    });
    return response.data;
  }
};

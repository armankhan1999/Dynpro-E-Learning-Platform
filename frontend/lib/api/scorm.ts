import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const scormApi = {
  upload: async (file: File, courseId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) formData.append('course_id', courseId);

    const response = await axios.post(`${API_URL}/scorm/upload`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getPackage: async (scormId: string) => {
    const response = await axios.get(`${API_URL}/scorm/${scormId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  launch: async (scormId: string) => {
    const response = await axios.post(`${API_URL}/scorm/${scormId}/launch`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  trackProgress: async (scormId: string, completionStatus: string, score?: number) => {
    const response = await axios.post(`${API_URL}/scorm/${scormId}/track`, {
      completion_status: completionStatus,
      score
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // External Content
  getExternalContent: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/external-content`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  createExternalContent: async (data: any) => {
    const response = await axios.post(`${API_URL}/external-content`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateExternalContent: async (contentId: string, data: any) => {
    const response = await axios.put(`${API_URL}/external-content/${contentId}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteExternalContent: async (contentId: string) => {
    const response = await axios.delete(`${API_URL}/external-content/${contentId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

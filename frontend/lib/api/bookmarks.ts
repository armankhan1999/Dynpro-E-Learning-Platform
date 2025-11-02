import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const bookmarksApi = {
  bookmarkCourse: async (courseId: string) => {
    const response = await axios.post(`${API_URL}/bookmarks/courses/${courseId}`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  removeBookmark: async (courseId: string) => {
    const response = await axios.delete(`${API_URL}/bookmarks/courses/${courseId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getMyBookmarks: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/bookmarks`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  }
};

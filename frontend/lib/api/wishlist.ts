import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const wishlistApi = {
  addToWishlist: async (courseId: string) => {
    const response = await axios.post(`${API_URL}/wishlist/courses/${courseId}`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  removeFromWishlist: async (courseId: string) => {
    const response = await axios.delete(`${API_URL}/wishlist/courses/${courseId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getWishlist: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/wishlist`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  }
};

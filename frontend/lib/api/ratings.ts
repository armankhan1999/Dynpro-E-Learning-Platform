import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const ratingsApi = {
  createCourseRating: async (courseId: string, rating: number, review?: string) => {
    const response = await axios.post(`${API_URL}/ratings/courses/${courseId}/ratings`, {
      rating,
      review
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getCourseRatings: async (courseId: string) => {
    const response = await axios.get(`${API_URL}/ratings/courses/${courseId}/ratings`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateRating: async (courseId: string, ratingId: string, rating: number, review?: string) => {
    const response = await axios.put(`${API_URL}/ratings/courses/${courseId}/ratings/${ratingId}`, {
      rating,
      review
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteRating: async (courseId: string, ratingId: string) => {
    const response = await axios.delete(`${API_URL}/ratings/courses/${courseId}/ratings/${ratingId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getCourseReviews: async (courseId: string, skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/ratings/courses/${courseId}/reviews`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  markReviewHelpful: async (reviewId: string) => {
    const response = await axios.post(`${API_URL}/ratings/reviews/${reviewId}/helpful`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// Central API exports - Internal Employee E-Learning Platform
export * from './auth';
export * from './courses';
export * from './users';
export * from './enrollments';
export * from './assessments';
export * from './assignments';
export * from './discussions';
export * from './notifications';
export * from './certificates';
export * from './learningPaths';
export * from './files';
export * from './gamification';
export * from './analytics';
export * from './admin';
export * from './liveSessions';
export * from './ratings';
export * from './search';
export * from './reports';
export * from './categories';
export * from './teams';
export * from './quizzes';
export * from './content';
export * from './progress';
export * from './scorm';
export * from './tags';
export * from './bookmarks';
export * from './wishlist';
export * from './settings';
export * from './integrations';

// API client configuration
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

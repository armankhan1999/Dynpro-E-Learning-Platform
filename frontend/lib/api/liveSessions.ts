import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const liveSessionsApi = {
  create: async (data: any) => {
    const response = await axios.post(`${API_URL}/live/live-sessions`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAll: async (skip = 0, limit = 20) => {
    const response = await axios.get(`${API_URL}/live/live-sessions`, {
      params: { skip, limit },
      headers: getAuthHeader()
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/live/live-sessions/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/live/live-sessions/${id}`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/live/live-sessions/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  attend: async (id: string) => {
    const response = await axios.post(`${API_URL}/live/live-sessions/${id}/attend`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getAttendees: async (id: string) => {
    const response = await axios.get(`${API_URL}/live/live-sessions/${id}/attendees`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  uploadRecording: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/live/live-sessions/${id}/recording`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getCalendarEvents: async (startDate?: string, endDate?: string) => {
    const response = await axios.get(`${API_URL}/live/calendar/events`, {
      params: { start_date: startDate, end_date: endDate },
      headers: getAuthHeader()
    });
    return response.data;
  },

  syncCalendar: async () => {
    const response = await axios.post(`${API_URL}/live/calendar/sync`, null, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

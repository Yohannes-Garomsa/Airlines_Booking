import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/passengers`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const passengerService = {
  getAll: async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  create: async (passengerData) => {
    const response = await axios.post(API_URL, passengerData, { headers: getAuthHeader() });
    return response.data;
  },

  update: async (id, passengerData) => {
    const response = await axios.put(`${API_URL}/${id}`, passengerData, { headers: getAuthHeader() });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
  },

  verify: async (id, status, adminNotes) => {
    const response = await axios.patch(`${API_URL}/${id}/verify`, { status, adminNotes }, { headers: getAuthHeader() });
    return response.data;
  }
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

export const flightService = {
  getFlights: async (params) => {
    const response = await api.get('/flights', { params });
    return response.data;
  },
  
  createFlight: async (flightData, token) => {
    const response = await api.post('/flights', flightData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

export default api;

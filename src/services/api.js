const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Stats API
export const statsAPI = {
  getStats: async () => {
    return apiRequest('/stats');
  },

  saveSession: async (sessionData) => {
    return apiRequest('/stats/session', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  resetStats: async () => {
    return apiRequest('/stats/reset', {
      method: 'PUT',
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};

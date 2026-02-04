const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get token from localStorage (Firebase token)
const getToken = () => {
  return localStorage.getItem('firebaseToken');
};

// Get fresh token from Firebase (refreshes if expired)
const getFreshToken = async () => {
  const { auth } = await import('../config/firebase');
  const { onAuthStateChanged } = await import('firebase/auth');
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken(true); // Force refresh
          localStorage.setItem('firebaseToken', token);
          resolve(token);
        } catch (error) {
          console.error('Error getting fresh token:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  let token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  let response = await fetch(`${API_URL}${endpoint}`, config);
  let data = await response.json();

  // If token expired, try to refresh and retry once
  if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
    console.log('🔄 Token expired, refreshing...');
    token = await getFreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      response = await fetch(`${API_URL}${endpoint}`, config);
      data = await response.json();
    }
  }

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

  registerWithFirebase: async (name, email, firebaseUid) => {
    return apiRequest('/auth/register-firebase', {
      method: 'POST',
      body: JSON.stringify({ name, email, firebaseUid }),
    });
  },

  registerWithPhone: async (phoneNumber, firebaseUid) => {
    return apiRequest('/auth/register-phone', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, firebaseUid }),
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

// Daily challenge API
export const dailyChallengeAPI = {
  getProblems: async (date) => {
    const q = date ? `?date=${date}` : '';
    return apiRequest(`/daily-challenge/problems${q}`);
  },

  submit: async (date, answers) => {
    return apiRequest('/daily-challenge/submit', {
      method: 'POST',
      body: JSON.stringify({ date, answers }),
    });
  },

  getLeaderboard: async (date, limit = 20) => {
    const q = new URLSearchParams();
    if (date) q.set('date', date);
    if (limit) q.set('limit', limit);
    return apiRequest(`/daily-challenge/leaderboard?${q}`);
  },

  getMyScore: async (date) => {
    const q = date ? `?date=${date}` : '';
    return apiRequest(`/daily-challenge/me${q}`);
  },

  // Get score without saving (for unauthenticated users)
  getScoreOnly: async (date, answers) => {
    return apiRequest('/daily-challenge/score-only', {
      method: 'POST',
      body: JSON.stringify({ date, answers }),
    });
  },
};

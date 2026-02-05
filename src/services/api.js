const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

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

  const url = `${API_URL}${endpoint}`;
  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    const isNetworkError = !err.message || err.message === 'Failed to fetch' || err.name === 'TypeError';
    const base = API_URL.replace(/\/api\/?$/, '');
    const hint = isNetworkError
      ? `Cannot reach backend at ${base}. Set VITE_API_URL in Vercel (e.g. https://your-app.onrender.com/api) and redeploy.`
      : err.message;
    console.error('[API] Request failed:', url, err);
    throw new Error(hint);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(response.ok ? 'Invalid response' : `Server error ${response.status}`);
  }

  // If token expired, try to refresh and retry once
  if (response.status === 401 && data && data.code === 'TOKEN_EXPIRED') {
    console.log('🔄 Token expired, refreshing...');
    token = await getFreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      response = await fetch(url, config);
      try {
        data = await response.json();
      } catch {
        throw new Error(response.ok ? 'Invalid response' : `Server error ${response.status}`);
      }
    }
  }

  if (!response.ok) {
    throw new Error((data && data.message) || 'An error occurred');
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

// Daily challenge API (type: 'division' | 'equation' | 'multiplication')
export const dailyChallengeAPI = {
  getProblems: async (date, type = 'division') => {
    const q = new URLSearchParams();
    if (date) q.set('date', date);
    if (type) q.set('type', type);
    return apiRequest(`/daily-challenge/problems?${q}`);
  },

  submit: async (date, answers, type = 'division') => {
    return apiRequest('/daily-challenge/submit', {
      method: 'POST',
      body: JSON.stringify({ date, answers, type }),
    });
  },

  getLeaderboard: async (date, limit = 20, type = 'division') => {
    const q = new URLSearchParams();
    if (date) q.set('date', date);
    if (limit) q.set('limit', limit);
    if (type) q.set('type', type);
    return apiRequest(`/daily-challenge/leaderboard?${q}`);
  },

  getMyScore: async (date, type = 'division') => {
    const q = new URLSearchParams();
    if (date) q.set('date', date);
    if (type) q.set('type', type);
    return apiRequest(`/daily-challenge/me?${q}`);
  },

  getScoreOnly: async (date, answers, type = 'division') => {
    return apiRequest('/daily-challenge/score-only', {
      method: 'POST',
      body: JSON.stringify({ date, answers, type }),
    });
  },
};

// Admin API (requires admin account)
export const adminAPI = {
  getUsers: async () => {
    return apiRequest('/admin/users');
  },

  resetDailyChallenge: async (date, type = null) => {
    const opts = { method: 'DELETE' };
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (type) params.set('type', type);
    const q = params.toString();
    return apiRequest(`/admin/daily-challenge/reset${q ? `?${q}` : ''}`, opts);
  },
};

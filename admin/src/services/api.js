import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://navari.onrender.com/api';
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin JWT token to every request (stored as 'admin_token')
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error normalizer
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    error.message = message;

    // 401 from any non-login endpoint → forced logout
    // This catches: session expired, new login from another browser/device
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      // Clear storage
      localStorage.removeItem('admin_token');
      Object.keys(localStorage)
        .filter((k) => k.startsWith('admin_'))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();

      // Store message so Login page can show it as a toast
      const reason =
        message.includes('another device') || message.includes('another browser')
          ? '⚠️ Your session was ended because you logged in from another device.'
          : '🔒 Your session has expired. Please log in again.';
      sessionStorage.setItem('logout_reason', reason);

      // Hard redirect — ensures React state is fully reset
      window.location.replace('/login');
    }

    return Promise.reject(error);
  }
);

export default API;

import axios from 'axios';

// In development, Vite proxy forwards /api → http://localhost:5000/api
// In production (Vercel), set VITE_API_URL to your Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

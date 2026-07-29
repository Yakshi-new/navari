/**
 * imageUrl.js — Centralized image URL helper for the client app.
 *
 * In development: Vite proxy forwards /uploads → http://localhost:5000/uploads
 *   so SERVER_URL is empty and relative paths work as-is.
 *
 * In production: Set VITE_SERVER_URL=https://your-render-service.onrender.com
 *   in your Vercel / hosting environment variables.
 */
const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL.replace(/\/$/, '');
  }
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http')) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }
  return '';
};

const SERVER_URL = getBackendBaseUrl();

/**
 * Converts a stored image path to a fully-qualified URL.
 * @param {string} imagePath - e.g. "/uploads/product-123.jpg" or a full URL
 * @returns {string}
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;   // already absolute
  if (imagePath.startsWith('/images')) return imagePath; // local public asset
  if (imagePath.startsWith('/')) return `${SERVER_URL}${imagePath}`;
  return `${SERVER_URL}/${imagePath}`;
};

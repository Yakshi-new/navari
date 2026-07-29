/**
 * imageUrl.js — Centralized image URL helper for the client app.
 *
 * Automatically maps image paths to your Render backend server URL.
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
 * Converts a stored image path to a fully-qualified URL pointing to the backend.
 * @param {string|Array} imageInput - e.g. "/uploads/product-123.jpg", "/images/category-sarees.png", or full URL
 * @returns {string}
 */
export const getImageUrl = (imageInput) => {
  let imagePath = Array.isArray(imageInput) ? imageInput[0] : imageInput;
  if (!imagePath || typeof imagePath !== 'string') return '';

  imagePath = imagePath.trim();
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // Map legacy /images/ seed paths to actual /uploads/ backend paths
  let cleanPath = imagePath;
  if (cleanPath.startsWith('/images/category-sarees.png')) cleanPath = '/uploads/sarees/hero-saree.png';
  else if (cleanPath.startsWith('/images/category-kurtis.png')) cleanPath = '/uploads/kurtis/product-kurti.png';
  else if (cleanPath.startsWith('/images/category-accessories.png')) cleanPath = '/uploads/accessories/product-kurti.png';
  else if (cleanPath.startsWith('/images/collection.png')) cleanPath = '/uploads/banners/collection.png';
  else if (cleanPath.startsWith('/images/')) cleanPath = cleanPath.replace('/images/', '/uploads/banners/');

  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  return `${SERVER_URL}${cleanPath}`;
};

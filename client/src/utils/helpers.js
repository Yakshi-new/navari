/**
 * Returns the correct image URL.
 * - In development, Vite proxy serves /uploads/* from Express.
 * - In production, set VITE_SERVER_URL env var.
 * - Absolute URLs (http/https) are returned unchanged.
 */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.svg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${SERVER_URL}${imagePath}`;
};

export const formatPrice = (amount) => {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const getDiscountPercent = (price, discountPrice) => {
  if (!discountPrice || discountPrice <= 0) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

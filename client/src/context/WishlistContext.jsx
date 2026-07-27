import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user && user.wishlist) {
      setWishlist(user.wishlist);
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      return { success: false, requireLogin: true, error: 'Please login to add to wishlist' };
    }
    try {
      const { data } = await API.post(`/auth/wishlist/${productId}`);
      if (data.success) {
        // Refetch profile or dynamically update local state
        const { data: profileData } = await API.get('/auth/me');
        if (profileData.success) {
          setWishlist(profileData.user.wishlist || []);
        }
        return { success: true, action: data.action };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

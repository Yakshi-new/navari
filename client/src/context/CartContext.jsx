import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localCart = localStorage.getItem('cart');
    return localCart ? JSON.parse(localCart) : [];
  });
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, size = 'Free Size', color = '') => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product === product._id && item.size === size && item.color === color
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            image: product.images[0] || '',
            price: product.discountPrice > 0 ? product.discountPrice : product.price,
            quantity,
            size,
            color,
            stock: product.stock,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await API.post('/orders/validate-coupon', {
        code,
        subtotal: getSubtotal(),
      });
      if (data.success) {
        setCoupon(data.coupon);
        return { success: true, message: 'Coupon applied successfully' };
      }
    } catch (error) {
      setCoupon(null);
      return { success: false, error: error.message };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();
    if (coupon.discountType === 'percentage') {
      let disc = (subtotal * coupon.discountValue) / 100;
      return Math.round(disc);
    }
    return coupon.discountValue;
  };

  const getShippingCharge = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 999 ? 0 : 99;
  };

  const getTotalAmount = () => {
    return getSubtotal() - getDiscountAmount() + getShippingCharge();
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        getSubtotal,
        getDiscountAmount,
        getShippingCharge,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

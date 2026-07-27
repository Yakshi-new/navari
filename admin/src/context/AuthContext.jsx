import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success && data.user.role === 'admin') {
        setUser(data.user);
      } else {
        // Not an admin — force logout
        localStorage.removeItem('admin_token');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('admin_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        if (data.user.role !== 'admin') {
          return { success: false, error: 'Access denied. Admin accounts only.' };
        }
        localStorage.setItem('admin_token', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

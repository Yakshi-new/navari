import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * clearAdminStorage — wipes all admin-related browser storage.
 *
 * Cleared:
 *  - localStorage (admin_token + all admin_ prefixed keys)
 *  - sessionStorage (entirely)
 *  - Cache Storage API (service-worker / fetch caches)
 *
 * This is called by:
 *  - logout()      — manual Sign Out button
 *  - forceLogout() — 401 interceptor (kicked by new login from another device)
 *  - useInactivityLogout — 5-min inactivity timer
 */
export const clearAdminStorage = async () => {
  // 1. LocalStorage — token + all admin_ prefixed keys
  localStorage.removeItem('admin_token');
  Object.keys(localStorage)
    .filter((k) => k.startsWith('admin_'))
    .forEach((k) => localStorage.removeItem(k));

  // 2. SessionStorage — clear entirely
  sessionStorage.clear();

  // 3. Cache Storage API — clears service-worker caches and fetch caches
  if ('caches' in window) {
    try {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    } catch {
      // Non-critical — ignore errors (e.g. private/incognito mode restrictions)
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success && data.user.role === 'admin') {
        setUser(data.user);
      } else {
        await clearAdminStorage();
        setUser(null);
      }
    } catch {
      await clearAdminStorage();
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

  /**
   * logout — called by manual "Sign Out" button.
   * Tells server to clear sessionId, then wipes all local storage + caches.
   */
  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch {
      // Ignore network errors — clear storage regardless
    }
    await clearAdminStorage();
    setUser(null);
  }, []);

  /**
   * forceLogout — called by Axios 401 interceptor (kicked by new login from another device).
   * Does NOT call the server (the 401 means server already rejected us).
   * Stores a reason string so the Login page can display it as a toast.
   */
  const forceLogout = useCallback(async (reason) => {
    await clearAdminStorage();
    setUser(null);
    // Store reason so Login page can show it as a toast
    if (reason) sessionStorage.setItem('logout_reason', reason);
    window.location.replace('/login');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, forceLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

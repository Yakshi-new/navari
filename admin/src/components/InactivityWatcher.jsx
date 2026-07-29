/**
 * InactivityWatcher.jsx
 *
 * Thin wrapper component that activates the inactivity logout hook.
 * Rendered inside ProtectedRoute so it only runs while the admin is logged in.
 * Shows a visual countdown warning at 4:30 (30s before forced logout).
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';

const INACTIVITY_MS = 5 * 60 * 1000;   // 5 minutes
const WARN_BEFORE_MS = 30 * 1000;       // Show warning 30s before logout

const clearAdminStorage = () => {
  localStorage.removeItem('admin_token');
  Object.keys(localStorage)
    .filter((k) => k.startsWith('admin_'))
    .forEach((k) => localStorage.removeItem(k));
  sessionStorage.clear();
};

const sendLogoutBeacon = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) return;
  const BASE = import.meta.env.VITE_API_URL || '/api';
  navigator.sendBeacon(`${BASE}/auth/logout-beacon`, token);
};

const InactivityWatcher = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const warnRef  = useRef(null);
  const toastRef = useRef(null);
  const isLoggingOut = useRef(false);

  const performLogout = useCallback(async (reason) => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    if (toastRef.current) toast.dismiss(toastRef.current);

    try { await API.post('/auth/logout'); } catch { /* ignore */ }

    clearAdminStorage();

    sessionStorage.setItem('logout_reason', reason || 'Session expired due to inactivity.');
    navigate('/login', { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warnRef.current)  clearTimeout(warnRef.current);
    if (toastRef.current) { toast.dismiss(toastRef.current); toastRef.current = null; }
    isLoggingOut.current = false;

    // Warning at T-30s
    warnRef.current = setTimeout(() => {
      toastRef.current = toast(
        '⚠️ You will be logged out in 30 seconds due to inactivity.',
        { duration: 28000, icon: '🔒', id: 'inactivity-warn' }
      );
    }, INACTIVITY_MS - WARN_BEFORE_MS);

    // Logout at T
    timerRef.current = setTimeout(() => {
      performLogout('You were automatically logged out after 5 minutes of inactivity.');
    }, INACTIVITY_MS);
  }, [performLogout]);

  useEffect(() => {
    resetTimer();

    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    const onVisChange = () => {
      if (document.visibilityState === 'hidden') sendLogoutBeacon();
    };
    const onBeforeUnload = () => sendLogoutBeacon();

    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warnRef.current)  clearTimeout(warnRef.current);
      EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [resetTimer]);

  return null;
};

export default InactivityWatcher;

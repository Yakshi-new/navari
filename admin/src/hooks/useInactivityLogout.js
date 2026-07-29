/**
 * useInactivityLogout.js
 *
 * Handles ALL three auto-logout scenarios for the admin panel:
 *
 *  1. 5-minute inactivity   → timer fires → server logout + cache clear + redirect
 *  2. Tab / window close    → beforeunload → sendBeacon (fire-and-forget server logout)
 *                             + localStorage/sessionStorage/Cache API cleared synchronously
 *  3. New login elsewhere   → 401 from API interceptor → forceLogout() (handled in api.js)
 *
 * FIX (visibilitychange bug):
 *   The old code used 'visibilitychange' to detect tab close, but visibilitychange fires
 *   on EVERY tab switch, causing unwanted logouts. We now use ONLY 'beforeunload', which
 *   fires reliably when the tab/window is actually being closed or navigated away from.
 *   The inactivity timer covers the "tab left open but unused" case.
 *
 * Usage: Call this hook inside a component that is only rendered when the user is logged in
 *        (e.g., AdminLayout). It is safe to call once — all listeners are cleaned up on unmount.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';

/** 5 minutes of inactivity triggers auto-logout */
const INACTIVITY_MS = 5 * 60 * 1000;

// Activity events that reset the countdown
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

/**
 * clearAllStorage — wipes every form of browser storage used by the admin panel.
 * Also clears the browser Cache Storage API (service worker caches).
 */
const clearAllStorage = async () => {
  // 1. LocalStorage — remove admin token and all admin_ prefixed keys
  localStorage.removeItem('admin_token');
  Object.keys(localStorage)
    .filter((k) => k.startsWith('admin_'))
    .forEach((k) => localStorage.removeItem(k));

  // 2. SessionStorage — clear entirely
  sessionStorage.clear();

  // 3. Cache Storage API — clears any service-worker or browser-cached responses
  if ('caches' in window) {
    try {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    } catch {
      // Non-critical — ignore errors (e.g. private browsing mode restrictions)
    }
  }
};

/**
 * sendLogoutBeacon — fire-and-forget logout that works even during tab close.
 * navigator.sendBeacon guarantees delivery even as the page unloads.
 * Sends the raw JWT as text/plain — server's /logout-beacon route handles that.
 */
const sendLogoutBeacon = (beaconSentRef) => {
  if (beaconSentRef.current) return; // prevent double-send
  const token = localStorage.getItem('admin_token');
  if (!token) return;
  beaconSentRef.current = true;
  const BASE = import.meta.env.VITE_API_URL || '/api';
  navigator.sendBeacon(`${BASE}/auth/logout-beacon`, token);
};

const useInactivityLogout = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const isLoggingOut = useRef(false); // prevent double-logout on inactivity path
  const beaconSentRef = useRef(false); // prevent double-beacon on beforeunload

  /* ── Core logout function (used for inactivity timer expiry) ── */
  const performLogout = useCallback(
    async (reason = 'Your session expired due to 5 minutes of inactivity.') => {
      if (isLoggingOut.current) return;
      isLoggingOut.current = true;

      // Best-effort: tell server to clear sessionId in DB
      try {
        await API.post('/auth/logout');
      } catch {
        // Ignore — could be a network error; sessionId in DB will expire naturally
      }

      // Wipe all local storage + browser caches
      await clearAllStorage();

      // Store reason so the Login page can display it as a toast
      sessionStorage.setItem('logout_reason', reason);

      toast.error(reason, {
        duration: 5000,
        id: 'inactivity-logout', // prevent duplicate toasts
      });

      navigate('/login', { replace: true });
    },
    [navigate]
  );

  /* ── Reset the inactivity timer on any user interaction ── */
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performLogout('You were logged out after 5 minutes of inactivity.');
    }, INACTIVITY_MS);
  }, [performLogout]);

  useEffect(() => {
    // Start the inactivity countdown immediately on mount
    resetTimer();

    // Attach all activity listeners (passive = no scroll jank)
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true })
    );

    /* ── Tab / window close handler ── */
    // 'beforeunload' fires when the user:
    //   - closes the tab or window
    //   - navigates to a different domain
    //   - refreshes the page (F5 / Ctrl+R)
    //
    // For a page REFRESH we send the beacon but the page immediately reloads,
    // re-authenticates with the still-valid token in localStorage — this is fine
    // because the token is still valid (we only clear sessionId server-side via beacon).
    // The inactivity timer then starts fresh.
    const handleBeforeUnload = () => {
      // Synchronously clear localStorage so storage is gone before unload
      localStorage.removeItem('admin_token');
      Object.keys(localStorage)
        .filter((k) => k.startsWith('admin_'))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
      // Cache API cannot be cleared synchronously during beforeunload;
      // the async clearAllStorage is called during performLogout instead.

      // Fire-and-forget beacon to clear sessionId in DB
      sendLogoutBeacon(beaconSentRef);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    /* ── Cleanup on unmount (user logged out normally, component destroyed) ── */
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetTimer)
      );
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [resetTimer]);

  // Expose performLogout so other components can trigger a manual logout via this hook
  return { performLogout };
};

export default useInactivityLogout;

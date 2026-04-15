import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AuthUser } from '../types/auth';
import { getStoredUser, logout as logoutService } from '../services/authService';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  resetIdleTimer: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  const handleSessionExpired = useCallback(() => {
    setUserState(null);
    sessionStorage.removeItem('tsa_token');
    sessionStorage.removeItem('tsa_user');
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearIdleTimer();
    if (sessionStorage.getItem('tsa_token')) {
      idleTimerRef.current = setTimeout(handleSessionExpired, SESSION_TIMEOUT_MS);
    }
  }, [clearIdleTimer, handleSessionExpired]);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      resetIdleTimer();
    } else {
      clearIdleTimer();
    }
  }, [resetIdleTimer, clearIdleTimer]);

  const logout = useCallback(async () => {
    clearIdleTimer();
    await logoutService();
    setUserState(null);
  }, [clearIdleTimer]);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUserState(stored);
      resetIdleTimer();
    }
    setIsLoading(false);
  }, [resetIdleTimer]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      clearIdleTimer();
    };
  }, [resetIdleTimer, clearIdleTimer]);

  useEffect(() => {
    const handler = () => handleSessionExpired();
    window.addEventListener('tsa:session-expired', handler);
    return () => window.removeEventListener('tsa:session-expired', handler);
  }, [handleSessionExpired]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        logout,
        resetIdleTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

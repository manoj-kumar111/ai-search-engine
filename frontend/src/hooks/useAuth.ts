import { useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('ai_token');
    if (!token) {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`.replace(/\/api\/api\//, '/api/'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Invalid token');
        const data = await res.json();
        setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('ai_token');
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`.replace(/\/api\/api\//, '/api/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('ai_token', data.token);
      setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`.replace(/\/api\/api\//, '/api/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('ai_token', data.token);
      setAuthState({ user: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ai_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return {
    ...authState,
    login,
    signup,
    logout,
  };
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi } from '@/api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('accessToken')
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('accessToken'));

  // On mount: validate stored token by calling /auth/me
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (identifier: string, password: string) => {
    const { user, accessToken: token } = await authApi.login({ identifier, password });
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
    setUser(user);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const { user, accessToken: token } = await authApi.register({ name, username, email, password });
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
    setUser(user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

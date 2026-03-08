import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { User, getMe, logout as logoutService } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;  // exposed for feed/match/socket hooks
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Convenience helpers used by Login / SignUp
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, _setAccessTokenState] = useState<string | null>(
    () => localStorage.getItem('accessToken')
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const data = await getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('accessToken');
      _setAccessTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setAccessToken = useCallback((token: string) => {
    localStorage.setItem('accessToken', token);
    _setAccessTokenState(token);
  }, []);

  const refreshUser = useCallback(async () => {
    if (localStorage.getItem('accessToken')) {
      await loadUser();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      // best-effort
    } finally {
      localStorage.removeItem('accessToken');
      _setAccessTokenState(null);
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  // Convenience wrappers (used by Login/SignUp and our PostCard/HackathonMatch)
  const login = useCallback(async (identifier: string, password: string) => {
    const { login: loginService } = await import('@/services/auth');
    const data = await loginService({ identifier, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, username: string, email: string, password: string) => {
    const { register: registerService } = await import('@/services/auth');
    const data = await registerService({ name, username, email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    setAccessToken,
    logout,
    refreshUser,
    login,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  language: string;
  role: string;
  credits: number;
  settings: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  subscription: {
    type: 'free' | 'premium' | 'business';
    expiresAt?: string;
    autoRenew: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Telegram WebApp init data
      const initData = WebApp.initData;
      
      // Send init data to backend for verification
      const response = await axios.post(`${API_URL}/auth/telegram`, {
        initData
      });

      // Store token
      setToken(response.data.token);
      
      // Set user data
      setUser(response.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch current user
      axios.get(`${API_URL}/auth/me`)
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Update axios authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  store_id?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await api.get<User>('/auth/me');
      if (response.data && !response.error) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else if (response.error === 'Session expired') {
        logout();
      }
    } catch {
      logout();
    }
  };

  const login = async (username: string, password: string, remember = false): Promise<{ success: boolean; error?: string }> => {
    try {
      // FastAPI expects form data for OAuth2 password flow
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://onestoresolution-api.onrender.com'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.detail || 'Invalid credentials' };
      }

      const data = await response.json();
      const accessToken = data.access_token;

      // Store token
      if (remember) {
        localStorage.setItem('accessToken', accessToken);
      } else {
        sessionStorage.setItem('accessToken', accessToken);
      }

      // Fetch user info
      const userResponse = await api.get<User>('/auth/me');
      if (userResponse.error || !userResponse.data) {
        return { success: false, error: 'Failed to fetch user info' };
      }

      const userData = userResponse.data;
      setToken(accessToken);
      setUser(userData);
      
      if (remember) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData));
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
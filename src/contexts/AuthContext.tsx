import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  username?: string;
  email: string;
  full_name?: string;
  role?: string;
  store_id?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://onestoresolution-api.onrender.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // ---------------------------------------------------------
  // INITIALIZE AUTHENTICATION
  // ---------------------------------------------------------
  useEffect(() => {
    const initAuth = () => {
      try {
        // Check localStorage first (Remember Me)
        let storedToken = localStorage.getItem('accessToken');
        let storedUser = localStorage.getItem('user');

        // If not found, check sessionStorage
        if (!storedToken) {
          storedToken = sessionStorage.getItem('accessToken');
        }

        if (!storedUser) {
          storedUser = sessionStorage.getItem('user');
        }

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);

            setToken(storedToken);
            setUser(parsedUser);
          } catch (error) {
            console.error('Failed to parse stored user:', error);

            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ---------------------------------------------------------
  // REFRESH USER
  // ---------------------------------------------------------
  const refreshUser = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await api.get<User>('/auth/me');

      if (response.data && !response.error) {
        const userData = response.data;

        setUser(userData);

        // Update whichever storage currently contains the user
        if (localStorage.getItem('accessToken')) {
          localStorage.setItem('user', JSON.stringify(userData));
        }

        if (sessionStorage.getItem('accessToken')) {
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        console.error('Failed to refresh user:', response.error);

        if (response.error === 'Session expired') {
          logout();
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------
  const login = async (
    email: string,
    password: string,
    remember = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email.trim()) {
        return {
          success: false,
          error: 'Please enter your email address',
        };
      }

      if (!password) {
        return {
          success: false,
          error: 'Please enter your password',
        };
      }

      // -----------------------------------------------------
      // IMPORTANT:
      // Your Swagger API expects JSON:
      //
      // {
      //   "email": "vishal@example.com",
      //   "password": "mypasswordvishal"
      // }
      // -----------------------------------------------------

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      // -----------------------------------------------------
      // HANDLE API ERROR
      // -----------------------------------------------------

      if (!response.ok) {
        let errorMessage = 'Login failed';

        try {
          const errorData = await response.json();

          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((item: any) => item.msg || 'Invalid request')
              .join(', ');
          }
        } catch {
          errorMessage = `Login failed (${response.status})`;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      // -----------------------------------------------------
      // READ TOKEN
      // -----------------------------------------------------

      const data = await response.json();

      const accessToken = data.access_token;

      if (!accessToken) {
        return {
          success: false,
          error: 'Login succeeded but no access token was returned',
        };
      }

      // -----------------------------------------------------
      // TEMPORARILY STORE TOKEN
      // -----------------------------------------------------

      if (remember) {
        localStorage.setItem('accessToken', accessToken);

        // Remove old session token
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('accessToken', accessToken);

        // Remove old persistent token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }

      // Set token immediately so api.get can authenticate
      setToken(accessToken);

      // -----------------------------------------------------
      // FETCH CURRENT USER
      // -----------------------------------------------------

      const userResponse = await api.get<User>('/auth/me');

      if (userResponse.error || !userResponse.data) {
        // Clean up invalid login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');

        setToken(null);
        setUser(null);

        return {
          success: false,
          error:
            userResponse.error ||
            'Login succeeded, but failed to fetch user information',
        };
      }

      // -----------------------------------------------------
      // STORE USER
      // -----------------------------------------------------

      const userData = userResponse.data;

      setUser(userData);

      if (remember) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('user', JSON.stringify(userData));
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Login error:', error);

      return {
        success: false,
        error:
          error?.message ||
          'Unable to connect to the OneStoreSolution API',
      };
    }
  };

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  };

  // ---------------------------------------------------------
  // CONTEXT PROVIDER
  // ---------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------
// USE AUTH HOOK
// ---------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

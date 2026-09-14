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

interface LoginResponse {
  access_token: string;
  token_type: string;
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
  ) => Promise<{
    success: boolean;
    error?: string;
  }>;

  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://onestoresolution-api.onrender.com';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // ---------------------------------------------------------
  // Initialize authentication
  // ---------------------------------------------------------

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken =
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken');

        const storedUser =
          localStorage.getItem('user') ||
          sessionStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to restore authentication:', error);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');

        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ---------------------------------------------------------
  // Login
  // ---------------------------------------------------------

  const login = async (
    email: string,
    password: string,
    remember = false
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const cleanEmail = email.trim();

      if (!cleanEmail) {
        return {
          success: false,
          error: 'Please enter your email address.',
        };
      }

      if (!password) {
        return {
          success: false,
          error: 'Please enter your password.',
        };
      }

      console.log('Attempting login:', cleanEmail);

      // -----------------------------------------------------
      // IMPORTANT:
      // Your Swagger API expects JSON:
      //
      // {
      //   "email": "vishal@example.com",
      //   "password": "mypasswordvishal"
      // }
      // -----------------------------------------------------

      const loginResponse = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      if (!loginResponse.ok) {
        let errorMessage = 'Invalid email or password.';

        try {
          const errorData = await loginResponse.json();

          errorMessage =
            errorData?.detail ||
            errorData?.message ||
            errorMessage;
        } catch {
          // Keep default error message
        }

        console.error(
          'Login failed:',
          loginResponse.status,
          errorMessage
        );

        return {
          success: false,
          error: errorMessage,
        };
      }

      const loginData =
        (await loginResponse.json()) as LoginResponse;

      if (!loginData.access_token) {
        return {
          success: false,
          error: 'Login succeeded but no access token was returned.',
        };
      }

      const accessToken = loginData.access_token;

      console.log('Login successful, token received.');

      // -----------------------------------------------------
      // Clear old authentication first
      // -----------------------------------------------------

      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');

      // -----------------------------------------------------
      // Store token
      // -----------------------------------------------------

      if (remember) {
        localStorage.setItem(
          'accessToken',
          accessToken
        );
      } else {
        sessionStorage.setItem(
          'accessToken',
          accessToken
        );
      }

      // -----------------------------------------------------
      // Fetch logged-in user
      //
      // api.ts now checks BOTH localStorage and sessionStorage,
      // so the Authorization header will be included.
      // -----------------------------------------------------

      const userResponse =
        await api.get<User>('/auth/me');

      if (
        userResponse.error ||
        !userResponse.data
      ) {
        console.error(
          'Failed to fetch user:',
          userResponse.error
        );

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');

        return {
          success: false,
          error:
            userResponse.error ||
            'Login succeeded, but user information could not be loaded.',
        };
      }

      const userData = userResponse.data;

      // -----------------------------------------------------
      // Update React state
      // -----------------------------------------------------

      setToken(accessToken);
      setUser(userData);

      // -----------------------------------------------------
      // Store user
      // -----------------------------------------------------

      if (remember) {
        localStorage.setItem(
          'accessToken',
          accessToken
        );

        localStorage.setItem(
          'user',
          JSON.stringify(userData)
        );
      } else {
        sessionStorage.setItem(
          'accessToken',
          accessToken
        );

        sessionStorage.setItem(
          'user',
          JSON.stringify(userData)
        );
      }

      return {
        success: true,
      };
    } catch (error: unknown) {
      console.error('Login error:', error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect to the server.',
      };
    }
  };

  // ---------------------------------------------------------
  // Refresh user
  // ---------------------------------------------------------

  const refreshUser = async () => {
    const currentToken =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    if (!currentToken) {
      return;
    }

    try {
      const response =
        await api.get<User>('/auth/me');

      if (
        response.data &&
        !response.error
      ) {
        setUser(response.data);

        if (
          localStorage.getItem('accessToken')
        ) {
          localStorage.setItem(
            'user',
            JSON.stringify(response.data)
          );
        } else {
          sessionStorage.setItem(
            'user',
            JSON.stringify(response.data)
          );
        }
      } else if (
        response.error === 'Session expired'
      ) {
        logout();
      }
    } catch (error) {
      console.error(
        'Failed to refresh user:',
        error
      );

      logout();
    }
  };

  // ---------------------------------------------------------
  // Logout
  // ---------------------------------------------------------

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  };

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
// useAuth hook
// ---------------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}

import { useNavigate } from 'react-router-dom';

// Base URL - can be overridden by environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://onestoresolution-api.onrender.com';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class ApiClient {
  private navigate: ReturnType<typeof useNavigate>;

  constructor() {
    // We'll initialize navigate in the context of a component
    // This is a limitation - we'll instead use a static method and handle navigation elsewhere
    // For now, we'll throw errors and let components handle redirection
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('accessToken');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const config: RequestInit = {
      method,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Clear auth data and throw error for component to handle
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        throw new Error('Session expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error: any) {
      return { 
        data: null as unknown as T, 
        error: error.message || 'An unknown error occurred' 
      };
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  post<T>(endpoint: string, data: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, options);
  }

  put<T>(endpoint: string, data: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, options);
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }
}

export const api = new ApiClient();
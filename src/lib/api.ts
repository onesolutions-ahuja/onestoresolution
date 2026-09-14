const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://onestoresolution-api.onrender.com';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class ApiClient {
  private getToken(): string | null {
    // Check localStorage first, then sessionStorage
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: HeadersInit = {
      Accept: 'application/json',
      ...(data !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    };

    const config: RequestInit = {
      ...options,
      method,
      headers,
    };

    if (data !== undefined) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');

        return {
          data: null as unknown as T,
          error: 'Session expired',
        };
      }

      const contentType = response.headers.get('content-type') || '';

      let result: any = null;

      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = text ? { message: text } : null;
      }

      if (!response.ok) {
        return {
          data: null as unknown as T,
          error:
            result?.detail ||
            result?.message ||
            `Request failed: ${response.status}`,
        };
      }

      return {
        data: result as T,
      };
    } catch (error: unknown) {
      console.error(`API request failed: ${method} ${endpoint}`, error);

      const message =
        error instanceof Error
          ? error.message
          : 'Failed to connect to the API';

      return {
        data: null as unknown as T,
        error: message,
      };
    }
  }

  get<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      'GET',
      undefined,
      options
    );
  }

  post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      'POST',
      data,
      options
    );
  }

  put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      'PUT',
      data,
      options
    );
  }

  delete<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      'DELETE',
      undefined,
      options
    );
  }
}

export const api = new ApiClient();

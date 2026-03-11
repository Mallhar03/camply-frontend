export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    details?: unknown[];
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
  _isRetry = false
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('accessToken');

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      credentials: 'include', // Important: sends cookies for refresh token
    });

    const body = await res.json();

    if (!res.ok) {
      if (res.status === 401 && !_isRetry) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (!refreshRes.ok) {
            throw new Error('Refresh failed');
          }
          
          const refreshBody = await refreshRes.json();
          if (refreshBody.data?.accessToken) {
            localStorage.setItem('accessToken', refreshBody.data.accessToken);
            return await apiFetch<T>(path, options, true);
          } else {
            throw new Error('No access token in refresh response');
          }
        } catch (refreshErr) {
          localStorage.removeItem('accessToken');
          window.dispatchEvent(new Event("auth:logout"));
          throw new ApiError(
            body?.error?.message || 'Request failed',
            res.status,
            body?.error?.details
          );
        }
      }

      if (res.status === 401 && _isRetry) {
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new Event("auth:logout"));
      }

      throw new ApiError(
        body?.error?.message || 'Request failed',
        res.status,
        body?.error?.details
      );
    }

    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error. Please check your connection.');
  }
}

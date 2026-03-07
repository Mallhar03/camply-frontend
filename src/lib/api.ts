const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    details?: any[];
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit
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

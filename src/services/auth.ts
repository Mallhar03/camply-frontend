import { apiFetch } from '@/lib/api';

export type TrustLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  college?: string;
  skills?: string[];
  trustLevel: TrustLevel;
  trustScore: number;
  createdAt: string;
  _count?: {
    posts: number;
    teamMembers: number;
  };
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

// Register new user
export async function register(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data!;
}

// Login existing user
export async function login(data: { identifier: string; password: string }) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data!;
}

// Get current user profile
export async function getMe() {
  const response = await apiFetch<{ user: User }>('/api/v1/auth/me');
  return response.data!;
}

// Logout
export async function logout() {
  await apiFetch('/api/v1/auth/logout', { method: 'POST' });
  localStorage.removeItem('accessToken');
}

// Refresh access token
export async function refreshToken() {
  const response = await apiFetch<{ accessToken: string }>('/api/v1/auth/refresh', {
    method: 'POST',
  });
  return response.data!;
}

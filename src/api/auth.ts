import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string | null;
  college?: string;
  skills: string[];
  trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  trustScore: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: {
    identifier: string; // email or username
    password: string;
  }): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/login', data),

  logout: (): Promise<null> =>
    apiClient.post<null>('/auth/logout', {}),

  me: (): Promise<{ user: User }> =>
    apiClient.get<{ user: User }>('/auth/me'),
};

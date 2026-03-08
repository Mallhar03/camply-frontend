/**
 * api/client.ts — thin adapter on top of the upstream apiFetch
 * Provides the get/post/put/delete helpers used by feed.ts and match.ts.
 * Auth headers and credentials:include are handled by lib/api.ts (apiFetch).
 */
import { apiFetch, ApiError } from '@/lib/api';

export { ApiError };

// Base path prefix
const BASE = '/api/v1';

export const apiClient = {
  get: <T>(path: string): Promise<T> =>
    apiFetch<T>(`${BASE}${path}`).then((r) => r.data as T),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(`${BASE}${path}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => r.data as T),

  put: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(`${BASE}${path}`, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => r.data as T),

  delete: <T>(path: string): Promise<T> =>
    apiFetch<T>(`${BASE}${path}`, { method: 'DELETE' }).then((r) => r.data as T),
};

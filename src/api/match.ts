import { apiClient } from './client';

export interface MatchProfile {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  college: string | null;
  skills: string[];
  trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  trustScore: number;
}

export interface ProfilesResponse {
  profiles: MatchProfile[];
}

export interface SwipeResponse {
  matched: boolean;
  toUserId?: string;
}

export const matchApi = {
  /** Fetch batch of profiles the user hasn't swiped yet */
  getProfiles: (skills?: string): Promise<ProfilesResponse> => {
    const params = new URLSearchParams({ limit: '20' });
    if (skills) params.append('skills', skills);
    return apiClient.get<ProfilesResponse>(`/match/profiles?${params}`);
  },

  /** Send a swipe — action: 'like' (right) | 'pass' (left) */
  swipe: (toUserId: string, action: 'like' | 'pass'): Promise<SwipeResponse> =>
    apiClient.post<SwipeResponse>('/match/like', { toUserId, action }),

  /** Fetch mutual matches */
  getMatches: () =>
    apiClient.get<{ matches: MatchProfile[] }>('/match/matches'),
};

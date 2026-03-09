import { apiFetch } from '@/lib/api';

export type PostCategory = 'QUERY' | 'SOLUTION' | 'JOB' | 'DISCUSSION';
export type TrustLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface PostAuthor {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  trustLevel: TrustLevel;
}

export interface Post {
  id: string;
  content: string;
  category: PostCategory;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  _count: {
    comments: number;
    votes: number;
  };
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
}

export interface FeedResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Get paginated feed
export async function getFeed(params?: {
  page?: number;
  limit?: number;
  category?: PostCategory | string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category && params.category !== 'all') {
    // Map frontend lowercase filters to backend uppercase enums
    const catMap: Record<string, string> = {
      queries: 'QUERY',
      solutions: 'SOLUTION',
      jobs: 'JOB',
      discussions: 'DISCUSSION'
    };
    const c = catMap[params.category.toLowerCase()] || params.category.toUpperCase();
    queryParams.append('category', c);
  }

  const url = `/api/v1/posts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiFetch<FeedResponse>(url);
  return response.data!;
}

// Create a new post
export async function createPost(data: {
  content: string;
  category: string;
}) {
  const response = await apiFetch<{ post: Post }>('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data!.post;
}

// Upvote or downvote a post
export async function votePost(postId: string, value: 1 | -1) {
  const response = await apiFetch<{ voted: boolean; value?: number }>(`/api/v1/posts/${postId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  });
  return response.data!;
}

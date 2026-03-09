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

export async function deletePost(postId: string): Promise<void> {
  await apiFetch(`/api/v1/posts/${postId}`, { method: 'DELETE' });
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
    trustLevel: string;
  };
}

export async function getPostById(postId: string): Promise<Post & { comments: Comment[] }> {
  const response = await apiFetch<{ post: Post & { comments: Comment[] } }>(
    `/api/v1/posts/${postId}`
  );
  return response.data!.post;
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const response = await apiFetch<{ post: { comments: Comment[] } }>(
    `/api/v1/posts/${postId}`
  );
  return response.data!.post.comments;
}

export async function addComment(postId: string, content: string): Promise<Comment> {
  const response = await apiFetch<{ comment: Comment }>(
    `/api/v1/posts/${postId}/comments`,
    { method: 'POST', body: JSON.stringify({ content }) }
  );
  return response.data!.comment;
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

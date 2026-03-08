import { apiClient } from './client';

export interface Author {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface Post {
  id: string;
  content: string;
  category: 'query' | 'solution' | 'job' | 'discussion';
  createdAt: string;
  updatedAt: string;
  author: Author;
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

// Ensure the structure returned by the API is compatible with Feed.tsx expected interface by mapping it
export const mapPostToFrontendFormat = (backendPost: Post) => {
  return {
    ...backendPost,
    // Add any necessary legacy mapping fields here to not break existing components
    username: backendPost.author.username,
    trustLevel: backendPost.author.trustLevel || 'bronze',
    timeAgo: new Date(backendPost.createdAt).toLocaleDateString(), // simplified for now
    comments: backendPost._count?.comments || 0,
  };
};

export const fetchFeed = async (page = 1, limit = 10, category?: string): Promise<FeedResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (category && category !== 'all') {
    // Backend expects uppercase or mapped enum values typically, checking controller
    // The controller uses `category: category as any`, we'll pass it exact
    params.append('category', category.toUpperCase()); // adjusting convention usually 'QUERY' etc 
  }

  const response = await apiClient.get<FeedResponse>(`/posts?${params.toString()}`);
  
  // Format the posts immediately to reduce component logic
  return {
    ...response,
    posts: response.posts.map(mapPostToFrontendFormat)
  };
};

export const createPost = async (content: string, category: string): Promise<{ post: Post }> => {
  return apiClient.post<{ post: Post }>('/posts', { content, category: category.toUpperCase() });
};

export const deletePost = async (id: string): Promise<null> => {
  return apiClient.delete<null>(`/posts/${id}`);
};

export const votePost = async (id: string, value: 1 | -1): Promise<{ voted: boolean, value?: number }> => {
  return apiClient.post<{ voted: boolean, value?: number }>(`/posts/${id}/vote`, { value });
};

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
    trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
}

export const fetchComments = async (postId: string): Promise<{ comments: Comment[] }> => {
  // Comments are embedded in the single-post response
  return apiClient.get<{ post: { comments: Comment[] } }>(`/posts/${postId}`)
    .then(({ post }) => ({ comments: post.comments }));
};

export const addComment = async (postId: string, content: string): Promise<{ comment: Comment }> => {
  return apiClient.post<{ comment: Comment }>(`/posts/${postId}/comments`, { content });
};

// Map frontend filter names to backend PostCategory enum values
export const mapFilterToCategory = (filter: string): string | undefined => {
  const map: Record<string, string> = {
    queries: 'QUERY',
    solutions: 'SOLUTION',
    discussions: 'DISCUSSION',
    jobs: 'JOB',
  };
  return map[filter];
};

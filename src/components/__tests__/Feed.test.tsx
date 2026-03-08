import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Feed } from '../Feed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as feedApi from '../../api/feed';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock the API module
vi.mock('../../api/feed', () => ({
  fetchFeed: vi.fn(),
  createPost: vi.fn(),
  mapPostToFrontendFormat: Object.assign,
}));

// Mock PostCard to simplify testing the Feed logic
vi.mock('../../components/PostCard', () => ({
  PostCard: ({ content, username }: any) => (
    <div data-testid="post-card">
      <span>{username}</span>
      <span>{content}</span>
    </div>
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }, 
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

describe('Feed Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const mockPosts = {
    posts: [
      {
        id: '1',
        content: 'Test Post Content',
        category: 'discussion',
        timeAgo: 'Just now',
        comments: 0,
        upvotes: 10,
        downvotes: 0,
        userVote: null,
        username: '@tester',
        trustLevel: 'gold',
      },
      {
        id: '2',
        content: 'Another Post',
        category: 'job',
        timeAgo: '1h ago',
        comments: 2,
        upvotes: 5,
        downvotes: 1,
        userVote: 1,
        username: '@jobseeker',
        trustLevel: 'silver',
      }
    ],
    pagination: { page: 1, limit: 10, total: 2, totalPages: 1, hasMore: false },
  };

  it('renders loading state initially', () => {
    vi.mocked(feedApi.fetchFeed).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Feed />);
    expect(screen.getByText(/loading feed/i)).toBeInTheDocument();
  });

  it('renders posts after successful fetch', async () => {
    vi.mocked(feedApi.fetchFeed).mockResolvedValue(mockPosts as any);
    
    renderWithProviders(<Feed />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Post Content')).toBeInTheDocument();
      expect(screen.getByText('@tester')).toBeInTheDocument();
      expect(screen.getAllByTestId('post-card')).toHaveLength(2);
    });
  });

  it('renders error state if fetch fails', async () => {
    vi.mocked(feedApi.fetchFeed).mockRejectedValue(new Error('Failed to load'));
    
    renderWithProviders(<Feed />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading feed/i)).toBeInTheDocument();
    });
  });

  it('refetches when filter is clicked', async () => {
    vi.mocked(feedApi.fetchFeed).mockResolvedValue(mockPosts as any);
    renderWithProviders(<Feed />);
    
    await waitFor(() => {
      expect(feedApi.fetchFeed).toHaveBeenCalledWith(1, 50, 'all');
    });

    const jobsFilterBtn = screen.getByText('Jobs');
    jobsFilterBtn.click();

    await waitFor(() => {
      expect(feedApi.fetchFeed).toHaveBeenCalledWith(1, 50, 'jobs');
    });
  });
});

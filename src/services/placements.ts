/**
 * placements.ts
 *
 * Frontend service for all placement-related API calls.
 * Interacts with:
 *  - /api/v1/jobs
 *  - /api/v1/partner-tests
 *  - /api/v1/placements
 */

import { apiFetch } from '@/lib/api';

// ─── Enums & Types from Backend ────────────────────────────

export type JobSource = 'CAMPLY_INTERNAL' | 'PARTNER';
export type JobStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export type PlacementDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type PlacementType = 'INTERVIEW' | 'ONLINE_TEST' | 'GROUP_DISCUSSION';

export interface Job {
  id: string;
  companyName: string;
  companyLogo: string | null;
  role: string;
  location: string;
  description: string;
  compensationType: string;
  compensationNote: string;
  perks: string[];
  requirements: string[];
  applyEmail: string;
  applySubject: string;
  source: JobSource;
  isPinned: boolean;
  createdAt: string;
}

export interface PartnerTest {
  id: string;
  platformName: string;
  logoUrl: string | null;
  title: string;
  description: string;
  testLink: string;
  registrationLink: string;
  createdAt: string;
}

export interface PlacementPost {
  id: string;
  company: string;
  companyLogo: string | null;
  role: string;
  package: string;
  location: string;
  difficulty: PlacementDifficulty;
  type: PlacementType;
  college: string;
  tags: string[];
  preview: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
    college: string;
  } | null;
  _count: {
    upvotes: number;
    comments: number;
  };
}

// ─── API Functions ─────────────────────────────────────────

/**
 * Fetch all active jobs. sorted by pinned first, then date.
 */
export async function fetchJobs() {
  const response = await apiFetch<{ jobs: Job[]; total: number }>('/api/v1/jobs');
  return response.data!;
}

/**
 * Submit a new job for review (public).
 */
export async function submitJob(data: any) {
  const response = await apiFetch<{ job: any }>('/api/v1/jobs/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data!;
}

/**
 * Update job status (admin only).
 */
export async function updateJobStatus(id: string, status: JobStatus) {
  const response = await apiFetch<{ job: any }>(`/api/v1/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return response.data!;
}

/**
 * Fetch active partner test platform cards.
 */
export async function fetchPartnerTests() {
  const response = await apiFetch<{ tests: PartnerTest[]; total: number }>('/api/v1/partner-tests');
  return response.data!;
}

/**
 * Fetch community placement experiences.
 * Supports optional type filtering.
 */
export async function fetchPlacements(type?: PlacementType) {
  const url = type ? `/api/v1/placements?type=${type}` : '/api/v1/placements';
  const response = await apiFetch<{
    posts: PlacementPost[];
    pagination: { hasNextPage: boolean; nextCursor: string | null };
  }>(url);
  return response.data!;
}

/**
 * Toggle upvote on a placement experience post.
 */
export async function togglePlacementUpvote(id: string) {
  const response = await apiFetch<{ upvoted: boolean; upvotes: number }>(
    `/api/v1/placements/${id}/upvote`,
    { method: 'POST' }
  );
  return response.data!;
}

/**
 * Add a comment to a placement experience post.
 */
export async function addPlacementComment(id: string, content: string) {
  const response = await apiFetch<{ comment: any }>(
    `/api/v1/placements/${id}/comments`,
    { method: 'POST', body: JSON.stringify({ content }) }
  );
  return response.data!;
}

/**
 * Delete a comment from a placement experience post.
 */
export async function deletePlacementComment(postId: string, commentId: string) {
  await apiFetch(`/api/v1/placements/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

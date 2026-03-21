import { apiFetch } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommunityRoom {
  id: string;
  name: string;
  topic: string;
  creatorId?: string; // Opt-in since backend might not always return it for old rooms
  _count: { members: number; messages: number };
  messages: Array<{ content: string; createdAt: string; sender: { username: string } }>;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; username: string; avatar: string | null };
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/** Fetch all community chat rooms */
export async function getCommunityRooms(): Promise<CommunityRoom[]> {
  const response = await apiFetch<Record<string, unknown>>('/api/v1/chats');
  const d = response.data!;
  // Backend may return { chats: [...] } or { rooms: [...] } or an array directly
  if (Array.isArray(d)) return d as unknown as CommunityRoom[];
  if (Array.isArray(d.chats)) return d.chats as unknown as CommunityRoom[];
  if (Array.isArray(d.rooms)) return d.rooms as unknown as CommunityRoom[];
  // Last resort: return empty so UI shows empty state, not crash
  console.warn('[chat service] Unexpected getCommunityRooms shape:', d);
  return [];
}

/** Join a community chat room (fire-and-forget) */
export async function joinRoom(chatId: string): Promise<void> {
  await apiFetch(`/api/v1/chats/${chatId}/join`, { method: 'POST' });
}

/** Fetch paginated messages for a chat room */
export async function getRoomMessages(
  chatId: string,
  cursor?: string
): Promise<{ messages: ChatMessage[]; nextCursor: string | null }> {
  const params = new URLSearchParams({ limit: '30' });
  if (cursor) params.append('cursor', cursor);
  const response = await apiFetch<{ messages: ChatMessage[]; nextCursor: string | null }>(
    `/api/v1/chats/${chatId}/messages?${params.toString()}`
  );
  return response.data!;
}
/** Create a new community chat room (Pro only) */
export async function createCommunityRoom(name: string, topic: string): Promise<CommunityRoom> {
  const response = await apiFetch<CommunityRoom>('/api/v1/chats', {
    method: 'POST',
    body: JSON.stringify({ name, topic, isPublic: true })
  });
  return response.data!;
}

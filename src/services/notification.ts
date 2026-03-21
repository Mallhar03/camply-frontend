import { apiFetch } from '@/lib/api';

export interface Notification {
  id: string;
  type: 'MATCH' | 'COMMENT' | 'VOTE' | 'MENTION' | 'SYSTEM' | 'TEAM_INVITE';
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const res = await apiFetch<{ notifications: Notification[], unreadCount: number }>('/api/v1/notifications');
  // ✅ Extract the notifications array from the data object
  return res.data?.notifications || [];
}

export async function markAsRead(id: string): Promise<void> {
  await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllAsRead(): Promise<void> {
  await apiFetch('/api/v1/notifications/read-all', { method: 'POST' });
}

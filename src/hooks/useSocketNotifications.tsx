import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api';

/**
 * Connects to the backend Socket.IO server and listens for real-time
 * events relevant to the current user.
 *
 * Events handled:
 *  - `match`      → shows an in-app toast "It's a match! 🎉"
 *  - `new-comment` → notifies author of a new comment
 *  - `new-vote`   → notifies author of an upvote
 *  - `team-invite` → notifies of a team invitation
 *
 * The socket joins the room `user:<userId>` so the backend can target it.
 */
export function useSocketNotifications() {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !accessToken) return;

    const socketUrl = API_BASE_URL || window.location.origin;
    const socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: accessToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'], // Prioritize websocket for production (Railway)
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Backend auto-joins user room via JWT auth middleware
    });

    socket.on('match', ({ matchedUserId }: { matchedUserId: string }) => {
      toast({
        title: "It's a match! 🎉",
        description: `You and another user are now connected! Start a conversation.`,
        duration: 6000,
      });
    });

    socket.on('new-comment', ({ postId }: { commenterId: string; postId: string }) => {
      toast({
        title: "New comment 💬",
        description: `Someone commented on your post.`,
      });
    });

    socket.on('new-vote', ({ value }: { voterId: string; postId: string; value: number }) => {
      toast({
        title: value === 1 ? "Someone upvoted your post 👍" : "Someone downvoted your post 👎",
        description: "Your trust score may be updated.",
      });
    });

    socket.on('team-invite', ({ teamName }: { teamId: string; teamName: string }) => {
      toast({
        title: `Team invite 🏆`,
        description: `You've been invited to join "${teamName}"!`,
        duration: 8000,
      });
    });

    socket.on('pro:activated', () => {
      toast({
        title: "Camply Pro Activated! ⚡",
        description: "Welcome to the elite tier. All premium features are now available.",
        variant: "default",
      });
      // Force refresh pro status
      window.dispatchEvent(new CustomEvent('pro-status-update'));
    });

    socket.on('mention', ({ senderName, content, postId }: { senderName: string; content: string; postId: string }) => {
      toast({
        title: `@${senderName} mentioned you`,
        description: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        duration: 5000,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, accessToken]); // re-run if user changes

  return socketRef;
}

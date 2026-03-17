import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, getRoomMessages } from '@/services/chat';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

export interface UseCommunityChat {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  isSending: boolean;
  typingUsers: string[];
  sendMessage: (content: string) => void;
  emitTyping: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export function useCommunityChat(
  chatId: string | null,
  accessToken: string | null,
  memberCount: number = 0
): UseCommunityChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingUserTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const { toast } = useToast();

  // ── Reset + (re)initialize when chatId changes ─────────────────────────────
  useEffect(() => {
    if (!chatId || !accessToken) return;

    // Clean up previous socket if any
    if (socketRef.current) {
      socketRef.current.emit('leave-chat', chatId);
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Reset state for the new room
    setMessages([]);
    setCursor(null);
    setHasMore(false);
    setIsLoading(true);
    setIsConnected(false);
    setTypingUsers([]);

    // 1. Fetch initial messages via HTTP
    getRoomMessages(chatId)
      .then(({ messages: initialMessages, nextCursor }) => {
        setMessages(initialMessages);
        setCursor(nextCursor);
        setHasMore(nextCursor !== null);
      })
      .catch((err) => {
        console.error('[useCommunityChat] Failed to load messages:', err);
        toast({ title: 'Could not load messages', description: err.message, variant: 'destructive' });
      })
      .finally(() => {
        setIsLoading(false);

        // 2. Create socket AFTER http resolves
        const socketUrl = API_BASE_URL || window.location.origin;
        const socket = io(socketUrl, {
          path: '/socket.io',
          auth: { token: accessToken },
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          transports: ['websocket', 'polling'], // Prioritize websocket for production
          withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          // 3. Join the chat room AFTER socket is connected
          socket.emit('join-chat', chatId);
        });

        socket.on('disconnect', () => setIsConnected(false));

        // 4. Listen for new messages
        socket.on('new-message', (msg: ChatMessage) => {
          setMessages((prev) => [...prev, msg]);
        });

        // 5. Typing indicators
        socket.on('user-typing', ({ username }: { username: string }) => {
          // Skip own typing indicator (check by username from auth — we only have access to the token here;
          // the component filters based on the user from useAuth when needed)
          setTypingUsers((prev) => {
            if (prev.includes(username)) return prev;
            return [...prev, username];
          });

          // Auto-remove after 3 seconds
          if (typingUserTimers.current[username]) {
            clearTimeout(typingUserTimers.current[username]);
          }
          typingUserTimers.current[username] = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== username));
            delete typingUserTimers.current[username];
          }, 3000);
        });
      });

    return () => {
      // Cleanup on unmount / chatId change
      const socket = socketRef.current;
      if (socket) {
        socket.emit('leave-chat', chatId);
        socket.disconnect();
        socketRef.current = null;
      }
      // Clear all typing timers
      Object.values(typingUserTimers.current).forEach(clearTimeout);
      typingUserTimers.current = {};
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [chatId, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !chatId) return;
      if (!isConnected) {
        toast({ title: 'Not connected', description: 'Reconnecting...' });
        return;
      }
      setIsSending(true);
      socketRef.current.emit('send-message', { chatId, content });
      setIsSending(false);
    },
    [chatId, isConnected, toast]
  );

  // ── Debounced typing emitter ──────────────────────────────────────────────
  const emitTyping = useCallback(() => {
    // Optimization for scale: don't broadcast typing events in massive rooms (100+ users)
    // to prevent thundering herd / broadcast storms on the backend WebSocket server
    if (memberCount >= 100) return;
    
    if (!socketRef.current || !chatId || !isConnected) return;
    if (typingTimerRef.current) return; // already debouncing — wait for it
    socketRef.current.emit('typing', { chatId });
    typingTimerRef.current = setTimeout(() => {
      typingTimerRef.current = null;
    }, 1000);
  }, [chatId, isConnected]);

  // ── Load more (older) messages ─────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!chatId || !cursor || !hasMore) return;
    try {
      const { messages: older, nextCursor } = await getRoomMessages(chatId, cursor);
      setMessages((prev) => [...older, ...prev]);
      setCursor(nextCursor);
      setHasMore(nextCursor !== null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load messages';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [chatId, cursor, hasMore, toast]);

  return {
    messages,
    isLoading,
    isConnected,
    isSending,
    typingUsers,
    sendMessage,
    emitTyping,
    loadMore,
    hasMore,
  };
}

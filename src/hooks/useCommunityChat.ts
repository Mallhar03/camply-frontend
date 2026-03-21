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
  deleteMessage: (messageId: string) => void;
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
  // ... rest of state stays same ...
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

  useEffect(() => {
    if (!chatId || !accessToken) return;

    if (socketRef.current) {
      socketRef.current.emit('leave-chat', chatId);
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setMessages([]);
    setCursor(null);
    setHasMore(false);
    setIsLoading(true);
    setIsConnected(false);
    setTypingUsers([]);

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

        const socketUrl = API_BASE_URL || window.location.origin;
        const socket = io(socketUrl, {
          path: '/socket.io',
          auth: { token: accessToken },
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          transports: ['websocket', 'polling'],
          withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          socket.emit('join-chat', chatId);
        });

        socket.on('disconnect', () => setIsConnected(false));

        socket.on('new-message', (msg: ChatMessage) => {
          setMessages((prev) => [...prev, msg]);
        });

        socket.on('message-deleted', ({ messageId }: { messageId: string }) => {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        });

        socket.on('user-typing', ({ username }: { username: string }) => {
          setTypingUsers((prev) => {
            if (prev.includes(username)) return prev;
            return [...prev, username];
          });

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
      const socket = socketRef.current;
      if (socket) {
        socket.emit('leave-chat', chatId);
        socket.disconnect();
        socketRef.current = null;
      }
      Object.values(typingUserTimers.current).forEach(clearTimeout);
      typingUserTimers.current = {};
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [chatId, accessToken]);

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

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!socketRef.current || !chatId || !isConnected) return;
      socketRef.current.emit('delete-message', { chatId, messageId });
    },
    [chatId, isConnected]
  );

  const emitTyping = useCallback(() => {
    if (memberCount >= 100) return;
    if (!socketRef.current || !chatId || !isConnected) return;
    if (typingTimerRef.current) return;
    socketRef.current.emit('typing', { chatId });
    typingTimerRef.current = setTimeout(() => {
      typingTimerRef.current = null;
    }, 1000);
  }, [chatId, isConnected, memberCount]);

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
    deleteMessage,
    emitTyping,
    loadMore,
    hasMore,
  };
}

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Users, Send, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCommunityRooms, joinRoom, CommunityRoom } from "@/services/chat";
import { useCommunityChat } from "@/hooks/useCommunityChat";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

// Consistent colour palette for the 4 community rooms (order-based, not ID-based)
const ROOM_COLORS = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500"];

const FALLBACK_ROOMS: CommunityRoom[] = [
  { id: "10000000-0000-0000-0000-000000000001", name: "RNSIT", topic: "RNS Institute of Technology community", _count: { members: 1240, messages: 0 }, messages: [] },
  { id: "10000000-0000-0000-0000-000000000002", name: "Luminous", topic: "Creative and Design enthusiasts", _count: { members: 856, messages: 0 }, messages: [] },
  { id: "10000000-0000-0000-0000-000000000003", name: "Startup Founders", topic: "Entrepreneurship and startup discussions", _count: { members: 623, messages: 0 }, messages: [] },
  { id: "10000000-0000-0000-0000-000000000004", name: "Project Ideas", topic: "Brainstorm and collaborate on projects", _count: { members: 945, messages: 0 }, messages: [] },
];

// ─── Skeleton loader for room cards ──────────────────────────────────────────
function RoomCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-8 bg-muted rounded w-20" />
      </div>
    </Card>
  );
}

// ─── VIEW A — Room List ───────────────────────────────────────────────────────
interface RoomListProps {
  onJoin: (room: CommunityRoom, colorIdx: number) => void;
  activeRoomId: string | null;
  isAuthenticated: boolean;
}

function RoomList({ onJoin, activeRoomId, isAuthenticated }: RoomListProps & { isAuthenticated: boolean }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<CommunityRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCommunityRooms();
      if (data.length === 0) {
        setRooms(FALLBACK_ROOMS);
      } else {
        setRooms(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => <RoomCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchRooms} variant="outline">Retry</Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rooms.map((room, idx) => {
        const color = ROOM_COLORS[idx % ROOM_COLORS.length];
        const isActive = room.id === activeRoomId;
        return (
          <Card
            key={room.id}
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-medium border-2 ${
              isActive ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <p className="text-sm text-muted-foreground">{room.topic}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{room._count.members} members</span>
              </div>
              <Button
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  joinRoom(room.id).catch(console.error); // fire-and-forget
                  onJoin(room, idx);
                }}
              >
                {isActive ? "Active" : "Join Chat"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── VIEW B — Chat Interface ──────────────────────────────────────────────────
interface ChatViewProps {
  room: CommunityRoom;
  onBack: () => void;
  roomColor: string;
}

function ChatView({ room, onBack, roomColor }: ChatViewProps) {
  const { user, accessToken } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { messages, isLoading, isConnected, isSending, typingUsers, sendMessage, emitTyping, loadMore, hasMore } =
    useCommunityChat(room.id, accessToken);

  // Filter own username from typing indicator
  const otherTypingUsers = typingUsers.filter((u) => u !== user?.username);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInputValue("");
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Community Chats</span>
            </Button>
            <div className={`w-8 h-8 ${roomColor} rounded-lg flex items-center justify-center`}>
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{room.name}</h3>
              <p className="text-sm text-muted-foreground">{room._count.members} members</p>
            </div>
          </div>
          {!isConnected && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium animate-pulse">
              Reconnecting...
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex flex-col h-[480px]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Load older messages */}
            {hasMore && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={loadMore} className="text-muted-foreground">
                  Load older messages
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No messages yet. Be the first to say something!</p>
              </div>
            )}

            {messages.map((msg) => {
              const initials = msg.sender.username
                .split(/[^a-zA-Z]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0].toUpperCase())
                .join("");
              const timeAgo = formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true });

              return (
                <div key={msg.id} className="flex gap-3 group hover:bg-muted/20 p-2 rounded-lg transition-all duration-200">
                  {msg.sender.avatar ? (
                    <img
                      src={msg.sender.avatar}
                      alt={msg.sender.username}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {initials || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.sender.username}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-foreground break-words">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {otherTypingUsers.length > 0 && (
              <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground animate-fade-in">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>{otherTypingUsers.join(", ")} {otherTypingUsers.length === 1 ? "is" : "are"} typing...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Message Input */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border-2 focus-within:border-primary transition-all duration-300">
              <Input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  emitTyping();
                }}
                placeholder={`Message ${room.name}...`}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={!isConnected}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={isSending || !isConnected || !inputValue.trim()}
              className="bg-gradient-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CommunityChats() {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<CommunityRoom | null>(null);
  const [activeRoomColor, setActiveRoomColor] = useState<string>(ROOM_COLORS[0]);



  if (activeRoom) {
    return (
      <div className="space-y-6">
        <ChatView
          room={activeRoom}
          onBack={() => setActiveRoom(null)}
          roomColor={activeRoomColor}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoomList
        activeRoomId={activeRoom?.id ?? null}
        isAuthenticated={!!user}
        onJoin={(room, colorIdx) => {
          setActiveRoom(room);
          setActiveRoomColor(ROOM_COLORS[colorIdx % ROOM_COLORS.length]);
        }}
      />
    </div>
  );
}
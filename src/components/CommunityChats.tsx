import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Users, Send, ArrowLeft, Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCommunityRooms, joinRoom, CommunityRoom } from "@/services/chat";
import { useCommunityChat } from "@/hooks/useCommunityChat";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useProStatus } from "@/hooks/useProStatus";
import { CreateRoomDialog } from "./CreateRoomDialog";
import { motion, AnimatePresence } from "framer-motion";

const ROOM_COLORS = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"];

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

interface RoomListProps {
  onJoin: (room: CommunityRoom, colorIdx: number) => void;
  activeRoomId: string | null;
  isAuthenticated: boolean;
  isPro: boolean;
}

function RoomList({ onJoin, activeRoomId, isAuthenticated, isPro }: RoomListProps) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<CommunityRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCommunityRooms();
      setRooms(data);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Active Communities
        </h2>
        <Button 
          size="sm" 
          onClick={() => isPro ? setCreateOpen(true) : navigate('/explore?tab=events')} // events tab has paywall
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {rooms.map((room, idx) => {
            const color = ROOM_COLORS[idx % ROOM_COLORS.length];
            const isActive = room.id === activeRoomId;
            return (
              <motion.div key={room.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card
                  className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                    isActive ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{room.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{room.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{room._count.members} members</span>
                    <Button
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate("/login");
                          return;
                        }
                        joinRoom(room.id).catch(console.error);
                        onJoin(room, idx);
                      }}
                    >
                      {isActive ? "Active" : "Join Chat"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <CreateRoomDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={(newRoom) => setRooms([newRoom, ...rooms])}
      />
    </div>
  );
}

import { useMentionAutocomplete } from "@/hooks/useMentionAutocomplete";

function ChatView({ room, onBack, roomColor }: { room: CommunityRoom; onBack: () => void; roomColor: string }) {
  const { user, accessToken } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { suggestions, handleInput, insertMention, isActive } = useMentionAutocomplete();

  const { messages, isLoading, isConnected, isSending, typingUsers, sendMessage, deleteMessage, emitTyping, loadMore, hasMore } =
    useCommunityChat(room.id, accessToken, room._count.members);

  const otherTypingUsers = typingUsers.filter((u) => u !== user?.username);

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
    <Card className="overflow-hidden border-none shadow-2xl">
      <div className="border-b p-4 bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className={`w-10 h-10 ${roomColor} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">{room.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`} />
                {room._count.members} members
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[550px] bg-muted/10">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {hasMore && (
              <Button variant="ghost" size="sm" onClick={loadMore} className="w-full text-xs text-muted-foreground">
                Load older messages
              </Button>
            )}

            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            )}

            {messages.map((msg) => {
              const isOwn = msg.sender.id === user?.id;
              const isCreator = room.creatorId === user?.id;
              const canDelete = isOwn || isCreator;

              return (
                <div key={msg.id} className={`flex gap-3 group items-start ${isOwn ? "flex-row-reverse" : ""}`}>
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                    {msg.sender.username[0].toUpperCase()}
                  </div>
                  <div className={`flex flex-col max-w-[80%] ${isOwn ? "items-end" : ""}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-semibold">{msg.sender.username}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(msg.createdAt))}</span>
                    </div>
                    <div className={`relative px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      isOwn ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card rounded-tl-none border"
                    }`}>
                      {msg.content}
                      {canDelete && (
                        <button 
                          onClick={() => deleteMessage(msg.id)}
                          className={`absolute -top-2 ${isOwn ? "-left-6" : "-right-6"} p-1 bg-destructive/10 text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-card/50 border-t relative">
          {isActive && (
            <div className="absolute bottom-full left-4 right-4 bg-card border rounded-lg shadow-lg z-50 mb-2 overflow-hidden">
              {suggestions.map((u) => (
                <button
                  key={u.id}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
                  onClick={() => {
                    setInputValue(insertMention(u, inputValue));
                    handleInput('', 0);
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {u.username[0].toUpperCase()}
                  </div>
                  <span>@{u.username}</span>
                </button>
              ))}
            </div>
          )}
          {otherTypingUsers.length > 0 && (
            <div className="text-[10px] text-muted-foreground mb-2 italic px-2">
              {otherTypingUsers.join(", ")} is typing...
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                emitTyping();
                handleInput(e.target.value, e.target.selectionEnd);
              }}
              placeholder="Type a message..."
              className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-11 px-4"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} disabled={isSending || !inputValue.trim()} size="icon" className="h-11 w-11 rounded-full shadow-lg">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CommunityChats() {
  const { user } = useAuth();
  const { data: pro } = useProStatus();
  const [activeRoom, setActiveRoom] = useState<CommunityRoom | null>(null);
  const [activeRoomColor, setActiveRoomColor] = useState<string>(ROOM_COLORS[0]);

  if (activeRoom) {
    return <ChatView room={activeRoom} onBack={() => setActiveRoom(null)} roomColor={activeRoomColor} />;
  }

  return (
    <RoomList
      activeRoomId={null}
      isAuthenticated={!!user}
      isPro={!!pro?.isPro}
      onJoin={(room, colorIdx) => {
        setActiveRoom(room);
        setActiveRoomColor(ROOM_COLORS[colorIdx % ROOM_COLORS.length]);
      }}
    />
  );
}
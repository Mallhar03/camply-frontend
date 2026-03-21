import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/TrustBadge";
import { Heart, X, MapPin, Code2, Loader2, RefreshCw } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchApi, MatchProfile } from "@/services/match";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// ─── Swipe Card ───────────────────────────────────────────────────────────────
// Handles drag / touch swipe with visual tilt feedback
interface SwipeCardProps {
  profile: MatchProfile;
  onSwipe: (action: "like" | "pass") => void;
  disabled?: boolean;
}

function SwipeCard({ profile, onSwipe, disabled }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"like" | "pass" | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState(0);
  const SWIPE_THRESHOLD = 80;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    lastTime.current = Date.now();
    isDragging.current = true;
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    currentX.current = e.clientX - startX.current;
    lastX.current = e.clientX;
    setDragOffset(currentX.current);
    if (currentX.current > 30) setSwipeDirection("like");
    else if (currentX.current < -30) setSwipeDirection("pass");
    else setSwipeDirection(null);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const offset = currentX.current;
    const velocity = Math.abs(offset) / (Date.now() - lastTime.current);

    if (Math.abs(offset) > SWIPE_THRESHOLD || (Math.abs(offset) > 30 && velocity > 0.5)) {
      const dir = offset > 0 ? 1 : -1;
      setIsExiting(true);
      setExitDirection(dir);
      setTimeout(() => onSwipe(dir === 1 ? "like" : "pass"), 300);
    } else {
      // snap back
      setDragOffset(0);
      setSwipeDirection(null);
    }
    currentX.current = 0;
  };

  const rotation = Math.min(Math.max(dragOffset / 8, -15), 15);
  const opacity = Math.max(1 - Math.abs(dragOffset) / 300, 0.4);

  return (
    <div
      ref={cardRef}
      className="relative select-none touch-none cursor-grab active:cursor-grabbing"
      style={{
        transform: isExiting
          ? `translateX(${exitDirection * window.innerWidth}px) rotate(${exitDirection * 30}deg)`
          : `translateX(${dragOffset}px) rotate(${rotation}deg)`,
        opacity: isExiting ? 0 : opacity,
        transition: isDragging.current
          ? "none"
          : isExiting
          ? "transform 0.3s ease-out, opacity 0.3s ease-out"
          : "transform 0.3s ease, opacity 0.3s ease",
        willChange: "transform",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Like / Pass overlay labels */}
      {swipeDirection === "like" && (
        <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-accent/90 text-white font-bold text-lg rounded-xl rotate-[-15deg] border-2 border-accent shadow-lg">
          CONNECT ✓
        </div>
      )}
      {swipeDirection === "pass" && (
        <div className="absolute top-4 right-4 z-10 px-4 py-2 bg-destructive/90 text-white font-bold text-lg rounded-xl rotate-[15deg] border-2 border-destructive shadow-lg">
          PASS ✗
        </div>
      )}

      <Card className="p-6 shadow-lg bg-card border border-border">
        {/* Profile Header */}
        <div className="text-center space-y-2 mb-4">
          {/* Avatar placeholder / initial */}
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-2xl font-bold text-accent border-2 border-accent/30">
            {profile?.name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold text-foreground">@{profile?.username || "unknown"}</h3>
            <TrustBadge level={(profile?.trustLevel || "low").toLowerCase()} />
          </div>
          {profile.college && (
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{profile.college}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed text-center mb-4 line-clamp-3">
            {profile.bio}
          </p>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <Code2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 6 && (
                <Badge variant="secondary" className="text-xs text-muted-foreground">
                  +{profile.skills.length - 6}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Swipe hint */}
        <p className="text-xs text-center text-muted-foreground mt-2">
          ← swipe left to pass · swipe right to connect →
        </p>
      </Card>
    </div>
  );
}

// ─── Main HackathonMatch ──────────────────────────────────────────────────────
export function HackathonMatch() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = sessionStorage.getItem("match_current_index");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [newUserCount, setNewUserCount] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const { toast } = useToast();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Persist index to session storage
  useEffect(() => {
    sessionStorage.setItem("match_current_index", currentIndex.toString());
  }, [currentIndex]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["match-profiles"],
    queryFn: () => matchApi.getProfiles(),
    enabled: !!user, // only fetch when logged in
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const profiles: MatchProfile[] = data?.profiles || [];
  const currentProfile = profiles[currentIndex];

  const swipeMutation = useMutation({
    mutationFn: ({ toUserId, action }: { toUserId: string; action: "like" | "pass" }) =>
      matchApi.swipe(toUserId, action),
    onSuccess: (result, { action }) => {
      if (result.matched) {
        toast({
          title: "It's a match! 🎉",
          description: "You've both connected. Start a conversation!",
          duration: 6000,
        });
      } else if (action === "like") {
        toast({ title: "Request sent!", description: "If they connect back, it's a match!" });
      }
      setIsAnimatingOut(false);
    },
    onError: (err: any) => {
      // Handle duplicate guard (409 Conflict)
      if (err?.statusCode === 409) {
        // Silently skip - user already interacted with this profile
        // Do not revert index, do not show error toast
        // Just reset animation state so next card loads
        setIsAnimatingOut(false);
        return;
      }
      
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      setIsAnimatingOut(false);
      toast({ title: "Action failed", description: err?.message || "Please try again.", variant: "destructive" });
    },
  });

  const resetAllMutation = useMutation({
    mutationFn: () => matchApi.resetAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-profiles"] });
      setCurrentIndex(0);
      sessionStorage.removeItem("match_current_index");
      setNewUserCount(0);
      toast({ 
        title: "Fresh start! 🚀", 
        description: "You'll see everyone again from the beginning." 
      });
    },
    onError: (err: any) => {
      toast({
        title: "Reset failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetRejectedMutation = useMutation({
    mutationFn: () => matchApi.resetRejected(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-profiles"] });
      setCurrentIndex(0);
      sessionStorage.removeItem("match_current_index");
      setNewUserCount(0);
      toast({ title: "Profiles refreshed!", description: "You can now see everyone again." });
    },
    onError: (err: any) => {
      toast({
        title: "Reset failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = useCallback(
    (action: "like" | "pass") => {
      if (!currentProfile || isAnimatingOut || swipeMutation.isPending) return;
      setIsAnimatingOut(true);
      setCurrentIndex((prev) => prev + 1);
      swipeMutation.mutate({ toUserId: currentProfile.id, action });
    },
    [currentProfile, isAnimatingOut, swipeMutation]
  );

  // ── Real-time new user detection ──────────────────────
  useEffect(() => {
    if (!user || !accessToken) return;

    const socket = io("/", {
      path: "/socket.io",
      auth: { token: accessToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    const isExhausted = !currentProfile;

    const handleNewUser = () => {
      if (isExhausted) {
        setNewUserCount((prev) => prev + 1);
      }
    };

    socket.on("new-user-joined", handleNewUser);

    return () => {
      socket.off("new-user-joined", handleNewUser);
      socket.close();
    };
  }, [user, accessToken, !!currentProfile]);

  const invitationQuery = useQuery({
    queryKey: ["match-invitations"],
    queryFn: () => matchApi.getInvitations(),
    enabled: !!user,
  });

  const invitationCount = invitationQuery.data?.invitations.length || 0;

  // Sync index if data changes (e.g. refresh returns fewer profiles)
  useEffect(() => {
    if (profiles.length > 0 && currentIndex >= profiles.length) {
      setCurrentIndex(0);
      sessionStorage.removeItem("match_current_index");
    }
  }, [profiles.length, currentIndex]);

  // Not logged in early return
  if (!user) {
    return (
      <Card className="p-6 max-w-md mx-auto text-center space-y-3">
        <Heart className="h-8 w-8 text-accent mx-auto" />
        <h2 className="text-lg font-semibold">Find Teammates</h2>
        <p className="text-sm text-muted-foreground">Log in to discover potential hackathon teammates.</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-8 max-w-md mx-auto flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-muted-foreground text-sm">Finding your teammates...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 max-w-md mx-auto text-center space-y-3">
        <p className="text-destructive">Failed to load profiles.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </Card>
    );
  }

  // All profiles swiped
  if (!currentProfile) {
    const isPoolEmpty = data?.isPoolEmpty;

    return (
      <Card className="p-8 max-w-md mx-auto text-center space-y-6 bg-card/60 backdrop-blur-md border-border shadow-2xl">
        <div className="space-y-2">
          <div className="text-5xl animate-bounce mb-4">{isPoolEmpty ? "🚀" : "👀"}</div>
          <h2 className="text-2xl font-bold text-foreground">
            {isPoolEmpty ? "You've sent match requests to everyone!" : "You've met everyone for now"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isPoolEmpty 
              ? "Great job! Now wait for them to accept or check your incoming invitations." 
              : "New teammates join daily. Reset to see people you passed on or wait for fresh faces."}
          </p>
        </div>

        {(newUserCount > 0 || invitationCount > 0) && (
          <div className="flex flex-col gap-2 items-center">
            {newUserCount > 0 && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium animate-pulse">
                ✨ {newUserCount} new {newUserCount === 1 ? 'person' : 'people'} joined!
              </div>
            )}
            {invitationCount > 0 && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium">
                📩 {invitationCount} new {invitationCount === 1 ? 'invitation' : 'invitations'}!
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          {isPoolEmpty ? (
            <Button
              variant="default"
              className="flex-1 h-12 bg-accent hover:bg-accent/90 text-white"
              onClick={() => resetAllMutation.mutate()}
              disabled={resetAllMutation.isPending}
            >
              {resetAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Start fresh
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => resetRejectedMutation.mutate()}
              disabled={resetRejectedMutation.isPending}
            >
              {resetRejectedMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              See profiles again
            </Button>
          )}

          <Button
            variant="default"
            className="flex-1 h-12 bg-accent hover:bg-accent/90 text-white"
            onClick={() => navigate("/profile")}
          >
            {invitationCount > 0 ? `Manage Invitations (${invitationCount})` : "Check my matches"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Stack counter */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Find Teammates</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {profiles.length}
        </span>
      </div>

      {/* Swipe card */}
      <SwipeCard
        key={currentProfile.id}
        profile={currentProfile}
        onSwipe={handleSwipe}
        disabled={swipeMutation.isPending || isAnimatingOut}
      />

      {/* Button controls */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
          onClick={() => handleSwipe("pass")}
          disabled={swipeMutation.isPending || isAnimatingOut}
        >
          <X className="h-5 w-5 text-destructive" />
          Pass
        </Button>
        <Button
          variant="default"
          size="lg"
          className="flex-1 bg-accent hover:bg-accent/90 text-white"
          onClick={() => handleSwipe("like")}
          disabled={swipeMutation.isPending || isAnimatingOut}
        >
          <Heart className="h-5 w-5" />
          Connect
        </Button>
      </div>
    </div>
  );
}
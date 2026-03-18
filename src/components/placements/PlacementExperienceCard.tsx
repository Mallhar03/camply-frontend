/**
 * PlacementExperienceCard.tsx
 *
 * Renders a community placement experience post.
 * Handles: upvote toggle, comment count display, GD inline panel.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ThumbsUp, MapPin, Building, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PlacementPost, togglePlacementUpvote } from "@/services/placements";
import { GDInlinePanel } from "./GDInlinePanel";

interface PlacementExperienceCardProps {
  post: PlacementPost;
}

const difficultyColors = {
  EASY: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  HARD: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const typeColors = {
  INTERVIEW: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  ONLINE_TEST: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  GROUP_DISCUSSION: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
};

const typeLabels = {
  INTERVIEW: "Interview",
  ONLINE_TEST: "Online Test",
  GROUP_DISCUSSION: "Group Discussion",
};

const formatTimeAgo = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function PlacementExperienceCard({ post }: PlacementExperienceCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isGDPanelOpen, setIsGDPanelOpen] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(post._count.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const initials = post.company
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Sign in to upvote",
        description: "Create an account to interact with posts.",
      });
      navigate("/login");
      return;
    }

    const previousCount = upvoteCount;
    const previousUpvoted = hasUpvoted;
    setUpvoteCount(hasUpvoted ? upvoteCount - 1 : upvoteCount + 1);
    setHasUpvoted(!hasUpvoted);

    try {
      const result = await togglePlacementUpvote(post.id);
      setUpvoteCount(result.upvotes);
      setHasUpvoted(result.upvoted);
    } catch {
      setUpvoteCount(previousCount);
      setHasUpvoted(previousUpvoted);
      toast({
        title: "Failed to upvote",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = () => {
    if (post.type === "GROUP_DISCUSSION") {
      setIsGDPanelOpen((prev) => !prev);
    }
  };

  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
        isGDPanelOpen ? "ring-1 ring-accent/50" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        {/* Header: Company & Meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-accent/10 border flex items-center justify-center">
              {post.companyLogo && !logoError ? (
                <img
                  src={post.companyLogo}
                  alt={post.company}
                  className="h-full w-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-sm font-bold text-accent">{initials}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground leading-none mb-1">
                {post.company}
              </h3>
              <p className="text-xs text-muted-foreground">{post.role}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={typeColors[post.type]}>
              {typeLabels[post.type]}
            </Badge>
            <Badge variant="outline" className={difficultyColors[post.difficulty]}>
              {post.difficulty}
            </Badge>
          </div>
        </div>

        {/* Content: Package, Location, College */}
        <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="text-accent font-semibold">{post.package}</span>
            <span>package</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <MapPin className="h-3 w-3" />
            <span>{post.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{post.college}</span>
          </div>
          <div className="text-right">
            {formatTimeAgo(post.createdAt)}
          </div>
        </div>

        {/* Preview text */}
        <p className="text-sm text-foreground/80 line-clamp-2 italic border-l-2 pl-3 py-1 bg-accent/5">
          "{post.preview}"
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-accent/10 text-accent border-none">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Footer: Actions */}
        <div className="flex items-center justify-between pt-2 border-t mt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                hasUpvoted ? "text-accent font-bold" : "text-muted-foreground hover:text-accent"
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? "fill-accent" : ""}`} />
              <span>{upvoteCount}</span>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{post._count.comments}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">shared by</span>
            <span className="text-xs font-medium text-foreground">
              @{post.author?.username || "anonymous"}
            </span>
          </div>
        </div>

        {/* GD Panel (Only for GD posts) */}
        <GDInlinePanel isOpen={isGDPanelOpen} />
      </div>
    </Card>
  );
}

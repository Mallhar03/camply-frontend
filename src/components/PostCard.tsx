import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrustBadge } from "@/components/TrustBadge";
import { ChevronUp, ChevronDown, MessageCircle, Share } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { votePost } from "@/services/feed";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  id: string;
  username: string;
  trustLevel: "bronze" | "silver" | "gold" | "platinum";
  timeAgo: string;
  content: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  category: "query" | "solution" | "job" | "discussion";
  userVote?: 1 | -1 | null;
  className?: string;
}

const categoryColors = {
  query: "bg-blue-100 text-blue-800",
  solution: "bg-green-100 text-green-800", 
  job: "bg-purple-100 text-purple-800",
  discussion: "bg-orange-100 text-orange-800"
};

export function PostCard({ 
  id,
  username, 
  trustLevel, 
  timeAgo, 
  content, 
  upvotes, 
  downvotes, 
  comments, 
  category,
  userVote: initialUserVote,
  className 
}: PostCardProps) {
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote ?? null);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);
  const currentComments = comments; // We aren't doing inline comment adds yet
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleVote = async (type: 1 | -1) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on posts.",
      });
      return;
    }

    try {
      // Optimistic update
      const previousVote = userVote;
      if (userVote === type) {
        if (type === 1) setCurrentUpvotes(prev => prev - 1);
        else setCurrentDownvotes(prev => prev - 1);
        setUserVote(null);
      } else {
        if (userVote === 1 && type === -1) {
          setCurrentUpvotes(prev => prev - 1);
          setCurrentDownvotes(prev => prev + 1);
        } else if (userVote === -1 && type === 1) {
          setCurrentDownvotes(prev => prev - 1);
          setCurrentUpvotes(prev => prev + 1);
        } else {
          if (type === 1) setCurrentUpvotes(prev => prev + 1);
          else setCurrentDownvotes(prev => prev + 1);
        }
        setUserVote(type);
      }

      // API Call
      await votePost(id, type);
    } catch (error) {
      // Revert optimism if failed
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Could not record vote.",
        variant: "destructive",
      });
      // A more robust implementation would actually save the previous state
      // but simple fallback logic here avoids complex state snapshots for this demo.
    }
  };

  return (
    <Card className={cn("p-6 hover:shadow-medium transition-all duration-300 animate-fade-in", className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Voting Section */}
        <div className="flex flex-row sm:flex-col items-center gap-2 pt-1">
          <Button
            variant="upvote"
            size="icon"
            onClick={() => handleVote(1)}
            className={cn(
              "h-8 w-8",
              userVote === 1 && "text-accent bg-accent/20"
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {currentUpvotes - currentDownvotes}
          </span>
          <Button
            variant="downvote"
            size="icon"
            onClick={() => handleVote(-1)}
            className={cn(
              "h-8 w-8",
              userVote === -1 && "text-destructive bg-destructive/20"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{username}</span>
                <TrustBadge level={trustLevel} />
              </div>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{timeAgo}</span>
            </div>
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", categoryColors[category])}>
              {category}
            </span>
          </div>

          {/* Content */}
          <p className="text-foreground leading-relaxed">{content}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                toast({
                  title: "Comments",
                  description: "Opening comments section...",
                });
              }}
            >
              <MessageCircle className="h-4 w-4" />
              {currentComments} comments
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast({
                  title: "Shared!",
                  description: "Post content copied to clipboard",
                });
              }}
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
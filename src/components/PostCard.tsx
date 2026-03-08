import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrustBadge } from "@/components/TrustBadge";
import { ChevronUp, ChevronDown, MessageCircle, Share, Send, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { votePost, fetchComments, addComment, Comment } from "@/api/feed";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

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
  discussion: "bg-orange-100 text-orange-800",
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
  userVote: initialUserVote = null,
  className,
}: PostCardProps) {
  const [localUserVote, setLocalUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments when panel is open
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => fetchComments(id),
    enabled: showComments,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: (value: 1 | -1) => votePost(id, value),
    onSuccess: (_data, value) => {
      // Optimistic already applied; on success invalidate feed to sync counts
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => {
      // Rollback optimistic update on error
      setLocalUserVote(initialUserVote);
      setLocalUpvotes(upvotes);
      setLocalDownvotes(downvotes);
      toast({ title: "Vote failed", description: "Please try again.", variant: "destructive" });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) => addComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setCommentText("");
      toast({ title: "Comment added!", description: "Your comment has been posted." });
    },
    onError: (err: any) => {
      toast({ title: "Failed to comment", description: err?.message || "Please try again.", variant: "destructive" });
    },
  });

  const handleVote = (type: 1 | -1) => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to vote.", variant: "destructive" });
      return;
    }

    // Optimistic update
    if (localUserVote === type) {
      // Toggle off
      setLocalUserVote(null);
      if (type === 1) setLocalUpvotes((p) => p - 1);
      else setLocalDownvotes((p) => p - 1);
    } else {
      if (localUserVote === 1 && type === -1) {
        setLocalUpvotes((p) => p - 1);
        setLocalDownvotes((p) => p + 1);
      } else if (localUserVote === -1 && type === 1) {
        setLocalDownvotes((p) => p - 1);
        setLocalUpvotes((p) => p + 1);
      } else {
        if (type === 1) setLocalUpvotes((p) => p + 1);
        else setLocalDownvotes((p) => p + 1);
      }
      setLocalUserVote(type);
    }

    voteMutation.mutate(type);
  };

  const handleAddComment = () => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to comment.", variant: "destructive" });
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText.trim());
  };

  const commentList = commentsData?.comments || [];

  return (
    <Card className={cn("p-6 hover:shadow-medium transition-all duration-300 animate-fade-in", className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Voting Section */}
        <div className="flex flex-row sm:flex-col items-center gap-2 pt-1">
          <Button
            variant="upvote"
            size="icon"
            onClick={() => handleVote(1)}
            className={cn("h-8 w-8", localUserVote === 1 && "text-accent bg-accent/20")}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {localUpvotes - localDownvotes}
          </span>
          <Button
            variant="downvote"
            size="icon"
            onClick={() => handleVote(-1)}
            className={cn("h-8 w-8", localUserVote === -1 && "text-destructive bg-destructive/20")}
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
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              {commentList.length || comments} comments
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast({ title: "Shared!", description: "Post content copied to clipboard" });
              }}
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Comment Section */}
          {showComments && (
            <div className="mt-4 space-y-3 border-t pt-3">
              {commentsLoading && (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              )}
              {commentList.map((c: Comment) => (
                <div key={c.id} className="flex gap-2 items-start">
                  <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{c.author.username}</span>
                      <TrustBadge level={c.author.trustLevel} />
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{c.content}</p>
                  </div>
                </div>
              ))}
              {commentList.length === 0 && !commentsLoading && (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
              )}
              {/* Add Comment Input */}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); }}}
                  disabled={commentMutation.isPending}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
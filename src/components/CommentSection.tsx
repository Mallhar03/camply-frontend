import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPostComments, addComment, deleteComment, Comment } from "@/services/feed";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { TrustBadge } from "@/components/TrustBadge";
import { Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  postId: string;
  postAuthorUsername: string;
  onCommentCountChange: (count: number) => void;
}

export function CommentSection({ postId, postAuthorUsername, onCommentCountChange }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getPostComments(postId),
  });

  async function handleSubmit() {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addComment(postId, commentText.trim());
      setCommentText("");
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      onCommentCountChange(comments.length + 1);
      toast({ title: "Comment added!" });
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);
    try {
      await deleteComment(postId, commentId);
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      onCommentCountChange(comments.length - 1);
      toast({ title: "Comment deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  function canDelete(comment: Comment) {
    if (!user) return false;
    return user.username === comment.author.username || user.username === postAuthorUsername;
  }

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          No comments yet. Be the first!
        </p>
      )}

      {!isLoading && comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {comment.author.username[0].toUpperCase()}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  @{comment.author.username}
                </span>
                <TrustBadge
                  level={comment.author.trustLevel.toLowerCase() as "bronze" | "silver" | "gold" | "platinum"}
                />
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              {canDelete(comment) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  disabled={deletingId === comment.id}
                  onClick={() => handleDelete(comment.id)}
                >
                  {deletingId === comment.id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Trash2 className="h-3 w-3" />
                  }
                </Button>
              )}
            </div>
            <p className="text-sm text-foreground">{comment.content}</p>
          </div>
        </div>
      ))}

      {isAuthenticated ? (
        <div className="flex gap-2 pt-2">
          <Textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="sm"
            className="self-end"
            disabled={!commentText.trim() || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          <a href="/login" className="text-primary hover:underline">Login</a> to comment
        </p>
      )}
    </div>
  );
}

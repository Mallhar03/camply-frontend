import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "@/services/feed";
import { formatTimeAgo } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrustBadge } from "@/components/TrustBadge";
import { Navigation } from "@/components/Navigation";
import { Helmet } from "react-helmet-async";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  QUERY: "bg-blue-100 text-blue-800",
  SOLUTION: "bg-green-100 text-green-800",
  JOB: "bg-purple-100 text-purple-800",
  DISCUSSION: "bg-orange-100 text-orange-800",
};

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id!),
    enabled: !!id,
  });

  return (
    <>
      <Navigation onTabChange={() => {}} />
      <main className="md:ml-64 p-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>

          {/* Loading */}
          {isLoading && (
            <Card className="p-6 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-20" />
            </Card>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-16 space-y-4">
              <p className="text-xl font-semibold text-foreground">Post not found</p>
              <p className="text-muted-foreground">This post may have been deleted.</p>
              <Button onClick={() => navigate("/")}>← Back to Feed</Button>
            </div>
          )}

          {/* Post */}
          {post && (
            <>
              <Helmet>
                <title>{`@${post.author.username}: ${post.content.slice(0, 60)}... | Camply`}</title>
                <meta name="description" content={post.content.slice(0, 160)} />
                <meta property="og:title" content={`Post by @${post.author.username} on Camply`} />
                <meta property="og:description" content={post.content.slice(0, 200)} />
                <meta property="og:url" content={`https://beta.camply.live/posts/${post.id}`} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary" />
              </Helmet>

              <Card className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      @{post.author.username}
                    </span>
                    <TrustBadge
                      level={post.author.trustLevel.toLowerCase() as "bronze" | "silver" | "gold" | "platinum"}
                    />
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(new Date(post.createdAt))}
                    </span>
                  </div>
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", categoryColors[post.category])}>
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                  <span>▲ {post.upvotes - post.downvotes} votes</span>
                  <span>💬 {post.comments.length} comments</span>
                </div>
              </Card>

              {/* Comments */}
              <Card className="p-6 space-y-4">
                <h2 className="font-semibold text-foreground">
                  {post.comments.length} Comments
                </h2>

                {post.comments.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No comments yet. Be the first to comment!
                  </p>
                )}

                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 py-3 border-t border-border first:border-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                      {comment.author.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          @{comment.author.username}
                        </span>
                        <TrustBadge
                          level={comment.author.trustLevel.toLowerCase() as "bronze" | "silver" | "gold" | "platinum"}
                        />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(new Date(comment.createdAt))}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}

        </div>
      </main>
    </>
  );
}

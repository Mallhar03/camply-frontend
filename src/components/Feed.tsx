import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Filter, Plus, Search as SearchIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreatePost } from "./CreatePost";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { generateWebSiteSchema } from "@/utils/seo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFeed } from "@/services/feed";
import { formatTimeAgo } from "@/lib/utils";

export function Feed() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["feed", activeFilter],
    queryFn: () => getFeed({ category: activeFilter }),
  });

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    toast({
      title: "Filter Applied",
      description: `Showing ${filter === "all" ? "all posts" : filter} posts`,
    });
  };

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  };

  const handlePostDeleted = (postId: string) => {
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  };

  const posts = data?.posts || [];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.author.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <SEO structuredData={generateWebSiteSchema()} />
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none z-10">
          <h1 className="text-xl font-bold text-foreground md:hidden">Camply</h1>
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => toast({ title: "Filter", description: "Filter options opened!" })}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setShowCreatePost(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts, users, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12"
            />
          </div>
        </div>

        {/* Filter Tabs - Desktop */}
        <div className="hidden md:flex items-center gap-2 px-4">
          <Button 
            variant={activeFilter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterClick("all")}
          >
            All
          </Button>
          <Button 
            variant={activeFilter === "queries" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterClick("queries")}
          >
            Queries
          </Button>
          <Button 
            variant={activeFilter === "solutions" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterClick("solutions")}
          >
            Solutions
          </Button>
          <Button 
            variant={activeFilter === "jobs" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterClick("jobs")}
          >
            Jobs
          </Button>
          <Button 
            variant={activeFilter === "discussions" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterClick("discussions")}
          >
            Discussions
          </Button>
        </div>

        {/* Posts */}
        <div className="space-y-4 px-4 pb-20 md:pb-4">
          {isLoading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {isError && (
            <div className="text-center p-8 text-destructive">
              Failed to load feed. Please try again.
            </div>
          )}
          {!isLoading && !isError && filteredPosts.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              No posts found. Be the first to post!
            </div>
          )}
          {filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              id={post.id}
              username={post.author.username}
              trustLevel={post.author.trustLevel.toLowerCase() as "bronze" | "silver" | "gold" | "platinum"}
              timeAgo={formatTimeAgo(new Date(post.createdAt))}
              content={post.content}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
              comments={post._count.comments}
              category={post.category.toLowerCase() as "query" | "solution" | "job" | "discussion"}
              userVote={post.userVote}
              onDelete={handlePostDeleted}
            />
          ))}
        </div>

        {showCreatePost && (
          <CreatePost
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </div>
    </>
  );
}
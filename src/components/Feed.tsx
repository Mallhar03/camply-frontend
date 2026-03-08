import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Filter, Plus, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreatePost } from "./CreatePost";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { generateWebSiteSchema } from "@/utils/seo";
import { useQuery } from '@tanstack/react-query';
import { fetchFeed, mapFilterToCategory } from '@/api/feed';

export function Feed() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const category = mapFilterToCategory(activeFilter);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['feed', activeFilter],
    queryFn: () => fetchFeed(1, 50, category),
  });

  const posts = data?.posts || [];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    toast({
      title: "Filter Applied",
      description: `Showing ${filter === "all" ? "all posts" : filter} posts`,
    });
  };

  const filteredPosts = posts.filter((post: any) => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      <SEO structuredData={generateWebSiteSchema()} />
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none">
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

        {/* Feed Status */}
        <div className="px-4">
          {isLoading && <p className="text-muted-foreground text-center py-4">Loading feed...</p>}
          {isError && <p className="text-destructive text-center py-4">Error loading feed: {error?.message}</p>}
          {!isLoading && !isError && filteredPosts.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No posts found.</p>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-4 px-4 pb-20 md:pb-4">
          {filteredPosts.map((post: any) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>

        {showCreatePost && (
          <CreatePost
            onClose={() => setShowCreatePost(false)}
            onPostCreated={() => {
              // React Query will handle cache invalidation, handled in CreatePost
              setShowCreatePost(false);
            }}
          />
        )}
      </div>
    </>
  );
}
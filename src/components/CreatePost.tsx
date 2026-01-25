import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Image, Link2, Hash } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  username: string;
  trustLevel: "bronze" | "silver" | "gold" | "platinum";
  timeAgo: string;
  content: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  category: "query" | "solution" | "job" | "discussion";
}

interface CreatePostProps {
  onClose: () => void;
  onPostCreated?: (post: Post) => void;
}

const postCategories = [
  { id: "query", label: "Query", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "solution", label: "Solution", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "job", label: "Job/Referral", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "discussion", label: "Discussion", color: "bg-orange-100 text-orange-800 border-orange-200" }
];

export function CreatePost({ onClose, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const handlePost = async () => {
    if (!content.trim() || !selectedCategory) return;
    
    setIsPosting(true);
    
    // Simulate posting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPost = {
      id: Date.now().toString(),
      username: isAnonymous ? "@anonymous_user" : "@current_user",
      trustLevel: "bronze" as const,
      timeAgo: "just now",
      content: content.trim(),
      upvotes: 0,
      downvotes: 0,
      comments: 0,
      category: selectedCategory as "query" | "solution" | "job" | "discussion"
    };
    
    // Save to local storage
    const existingPosts = JSON.parse(localStorage.getItem("posts") || "[]");
    localStorage.setItem("posts", JSON.stringify([newPost, ...existingPosts]));

    // Call callback if provided
    onPostCreated?.(newPost);
    
    toast({
      title: "Post Created!",
      description: "Your post has been shared with the community.",
    });
    
    // Reset form and close
    setContent("");
    setSelectedCategory("");
    setIsPosting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Create Post</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {postCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className={cn(
                    "cursor-pointer py-2 px-3 justify-center border transition-all",
                    selectedCategory === category.id ? category.color : "hover:bg-accent/50"
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              What's on your mind?
            </label>
            <Textarea
              placeholder="Share your thoughts, questions, or solutions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Hash className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                {content.length}/1000
              </span>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Anonymous Posting</p>
              <p className="text-xs text-muted-foreground">Your username will be hidden</p>
            </div>
            <Button
              variant={isAnonymous ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAnonymous(!isAnonymous)}
            >
              {isAnonymous ? "Anonymous" : "Public"}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="hero" 
              className="flex-1"
              onClick={handlePost}
              disabled={!content.trim() || !selectedCategory || isPosting}
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
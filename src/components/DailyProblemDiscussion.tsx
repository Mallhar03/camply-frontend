import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/TrustBadge";
import { User, MessageCircle, ThumbsUp } from "lucide-react";

interface DailyProblemDiscussionProps {
  onBack: () => void;
}

export function DailyProblemDiscussion({ onBack }: DailyProblemDiscussionProps) {
  return (
    <div className="space-y-6">
      <Button onClick={onBack}>Back to Problem</Button>
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">System Design: Scalable Chat Application</h2>
        <div className="space-y-4">
          {/* Original Post */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">@student_dev23</span>
              <TrustBadge level="gold" />
            </div>
            <p className="text-foreground text-sm leading-relaxed">
              "I'm struggling with system design interviews. How do I approach designing a scalable chat application? What are the key components I should focus on?"
            </p>
          </div>

          {/* Discussions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Discussions</h3>
            {/* Comment 1 */}
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">@backend_boss</span>
                <TrustBadge level="silver" />
              </div>
              <p className="text-foreground text-sm leading-relaxed">
                "Don't forget about load balancing! As your user base grows, you'll need to distribute traffic across multiple servers."
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <button className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> 15
                </button>
                <button className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Reply
                </button>
              </div>
            </div>
            {/* Comment 2 */}
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">@frontend_fanatic</span>
              </div>
              <p className="text-foreground text-sm leading-relaxed">
                "On the frontend, consider using a library like Socket.IO for handling the WebSocket connection. It has great fallback support."
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <button className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> 8
                </button>
                <button className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

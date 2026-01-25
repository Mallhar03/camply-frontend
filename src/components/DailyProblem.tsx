import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/TrustBadge";
import { Crown, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DailyProblemDiscussion } from "./DailyProblemDiscussion";

export function DailyProblem() {
  const { toast } = useToast();
  const [showDiscussion, setShowDiscussion] = useState(false);

  if (showDiscussion) {
    return <DailyProblemDiscussion onBack={() => setShowDiscussion(false)} />;
  }

  return (
    <Card className="p-6 bg-card border-accent/20 shadow-medium sticky top-4">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Problem of the Day</h2>
        <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
          <Clock className="h-4 w-4" />
          <span>Ends in 12h</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Problem Statement */}
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

        {/* Top Solution */}
        <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full font-medium">
              Top Solution
            </span>
            <span className="text-sm text-muted-foreground">by @system_guru</span>
            <TrustBadge level="platinum" />
          </div>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            "Start with the basics: WebSocket connections for real-time messaging, Redis for session management, and consider message queues for scaling..."
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>👍 127 upvotes</span>
            <span>💬 23 replies</span>
          </div>
        </div>

        <Button 
          variant="accent" 
          className="w-full"
          onClick={() => setShowDiscussion(true)}
        >
          View Full Discussion
        </Button>
      </div>
    </Card>
  );
}
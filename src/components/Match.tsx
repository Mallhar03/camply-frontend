import { HackathonMatch } from "@/components/HackathonMatch";
import { CreateTeamDialog } from "@/components/CreateTeamDialog";
import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/SEO";

export function Match() {
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  return (
    <>
      <SEO />
      <div className="space-y-6">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none">
          <h1 className="text-xl font-bold text-foreground md:hidden">Find Teammates</h1>
        </div>

      <div className="px-4 space-y-6 pb-20 md:pb-4">
        {/* Create Team Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Team Builder</h2>
            </div>
            <Button onClick={() => setShowCreateTeam(true)} size="sm">
              Create Team
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Build your dream team for hackathons and competitions. Find the perfect teammates with complementary skills.
          </p>
        </div>

        {/* Hackathon Matching */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Find Teammates</h2>
          </div>
          <HackathonMatch />
        </div>
      </div>

      <CreateTeamDialog open={showCreateTeam} onOpenChange={setShowCreateTeam} />
      </div>
    </>
  );
}
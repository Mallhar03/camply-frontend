
import { DailyProblem } from "@/components/DailyProblem";
import { CreateTeamDialog } from "@/components/CreateTeamDialog";
import { CommunityChats } from "@/components/CommunityChats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Trophy, Zap, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

const upcomingHackathons = [
  {
    name: "TechCrunch Disrupt 2025",
    date: "Dec 15-17, 2025",
    location: "Bengaluru, KA",
    participants: 1200,
    prizes: "₹100K",
    tags: ["AI", "Fintech", "Web3"]
  },
  {
    name: "RVCE TreeHacks",
    date: "Feb 14-16, 2026",
    location: "Bengaluru, KA", 
    participants: 1500,
    prizes: "₹175K",
    tags: ["Social Impact", "AR/VR", "IoT"]
  },
  {
name: "CodeRush Delhi",
date: "Nov 18-20, 2025",
location: "New Delhi, India",
participants: 650,
prizes: "₹5L",
tags: ["AI/ML", "Fintech", "Web3"]
},
{
name: "TechVortex Mumbai",
date: "Dec 5-7, 2025",
location: "Mumbai, India",
participants: 450,
prizes: "₹8L",
tags: ["IoT", "Robotics", "Automation"]
},
{
name: "DataStorm Bangalore",
date: "Jan 12-14, 2026",
location: "Bangalore, India",
participants: 750,
prizes: "₹42L",
tags: ["Data Science", "Analytics", "Cloud"]
},
{
name: "CyberHack Hyderabad",
date: "Feb 8-10, 2026",
location: "Hyderabad, India",
participants: 550,
prizes: "₹31L",
tags: ["Cybersecurity", "Blockchain", "Privacy"]
},
{
name: "InnovateX Chennai",
date: "Mar 15-17, 2026",
location: "Chennai, India",
participants: 900,
prizes: "₹5L",
tags: ["Startups", "E-commerce", "Mobile"]
},
{
name: "GreenCode Pune",
date: "Apr 22-24, 2026",
location: "Pune, India",
participants: 600,
prizes: "₹8L",
tags: ["Sustainability", "Clean Energy", "Environment"]
},
  {
    name: "Stanford Hackathon - International",
    date: "Jan 20-29, 2026", 
    location: "SanFrancisco, SA",
    participants: 1500,
    prizes: "$200K",
    tags: ["AI", "ML", "DeepTech"]
  }
  
];

export function Explore() {
  const { toast } = useToast();
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  const handleQuickAction = (action: string) => {
    if (action === "Create Team") {
      setCreateTeamOpen(true);
    } else {
      toast({
        title: action,
        description: `${action} feature coming soon...`,
      });
    }
  };

  return (
    <>
      <SEO />
      <div className="space-y-6">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none">
          <h1 className="text-xl font-bold text-foreground md:hidden">Explore</h1>
        </div>

      <div className="px-4 space-y-6 pb-20 md:pb-4">
        <Tabs defaultValue="featured" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="hackathons" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-6">
            {/* Daily Problem Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Featured Content</h2>
              </div>
              <DailyProblem />
            </div>

            {/* Quick Actions */}
            <Card className="p-6 bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => handleQuickAction("Create Team")}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Create Team</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => handleQuickAction("Host Event")}
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Host Event</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => handleQuickAction("Submit Project")}
                >
                  <Trophy className="h-6 w-6" />
                  <span className="text-sm">Submit Project</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => handleQuickAction("Find Mentor")}
                >
                  <Zap className="h-6 w-6" />
                  <span className="text-sm">Find Mentor</span>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Community Chats</h2>
              </div>
              <CommunityChats />
            </div>
          </TabsContent>

          <TabsContent value="hackathons" className="space-y-6">
            {/* Upcoming Hackathons */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Upcoming Hackathons</h2>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              
              <div className="space-y-4">
                {upcomingHackathons.map((hackathon) => (
                  <Card key={hackathon.name} className="p-4 hover:shadow-medium transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{hackathon.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{hackathon.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{hackathon.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-accent">{hackathon.prizes}</p>
                          <p className="text-xs text-muted-foreground">in prizes</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {hackathon.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{hackathon.participants} participants expected</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Learn More</Button>
                          <Button variant="accent" size="sm" onClick={() => setCreateTeamOpen(true)}>Find Team</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateTeamDialog 
        open={createTeamOpen} 
        onOpenChange={setCreateTeamOpen} 
      />
      </div>
    </>
  );
}
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/TrustBadge";
import { Settings, Share, Trophy, MessageCircle, ThumbsUp, Calendar, MapPin } from "lucide-react";
import { Team } from "@/components/Team";
import { SEO } from "@/components/SEO";

const userStats = {
  posts: 47,
  upvotes: 1234,
  comments: 189,
  followers: 89,
  following: 156
};

const recentActivity = [
  { type: "post", content: "Posted about React optimization techniques", time: "2h ago", engagement: 23 },
  { type: "comment", content: "Helped with system design question", time: "5h ago", engagement: 8 },
  { type: "upvote", content: "Upvoted a solution about Docker containers", time: "1d ago", engagement: 0 }
];

export function Profile() {
  return (
    <>
      <SEO />
      <div className="space-y-6">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground md:hidden">Profile</h1>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 pb-20 md:pb-4">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">CS</span>
            </div>
            
            {/* User Info */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-foreground">@code_student_99</h2>
                <TrustBadge level="gold" />
              </div>
              <p className="text-muted-foreground mb-2">Computer Science • RNSIT</p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>Bengaluru , KA</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Joined March 2025</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-foreground leading-relaxed max-w-md mx-auto">
              Full-stack developer passionate about AI and distributed systems. Always happy to help fellow students with coding challenges!
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">Python</Badge>
              <Badge variant="secondary">System Design</Badge>
              <Badge variant="secondary">Machine Learning</Badge>
              <Badge variant="secondary">AWS</Badge>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{userStats.posts}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{userStats.upvotes}</p>
            <p className="text-xs text-muted-foreground">Upvotes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{userStats.comments}</p>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{userStats.followers}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{userStats.following}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Trust Level Progress */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-5 w-5 text-badge-gold" />
            <h3 className="font-semibold text-foreground">Trust Level Progress</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current: Gold Member</span>
              <span className="text-muted-foreground">Next: Platinum</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-badge-gold h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">125 more upvotes needed for Platinum level</p>
          </div>
        </Card>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-3">
                  {activity.type === "post" && <MessageCircle className="h-4 w-4 text-primary" />}
                  {activity.type === "comment" && <MessageCircle className="h-4 w-4 text-accent" />}
                  {activity.type === "upvote" && <ThumbsUp className="h-4 w-4 text-badge-gold" />}
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.content}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      {activity.engagement > 0 && (
                        <span className="text-xs text-muted-foreground">{activity.engagement} engagements</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Teams */}
        <Team />

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
          <Button variant="hero" className="w-full">
            Upgrade to Premium
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/TrustBadge";
import { Loader2, LogOut, Mail, Calendar, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function Profile() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your profile</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  // Convert BRONZE -> bronze for TrustBadge component
  const trustLevel = user.trustLevel.toLowerCase() as "bronze" | "silver" | "gold" | "platinum";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6 md:p-8">
        {/* Header with Avatar */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <TrustBadge level={trustLevel} />
            </div>
            <p className="text-lg text-muted-foreground">@{user.username}</p>
            {user.hackathonsCount && (
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>{user.hackathonsCount} Hackathons</span>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>

          {user.college && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>🎓 {user.college}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Bio</h3>
            <p className="text-muted-foreground">{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {user._count?.posts || 0}
            </div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{user.trustScore}</div>
            <div className="text-sm text-muted-foreground">Trust Score</div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              toast({ title: "Coming soon", description: "Profile editing will be available soon." })
            }
          >
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/TrustBadge";
import { Loader2, LogOut, Mail, Calendar, UserCheck, UserX, Ghost } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchApi } from "@/services/match";
import { useToast } from "@/hooks/use-toast";

export function Profile() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invitationsQuery = useQuery({
    queryKey: ["match-invitations"],
    queryFn: () => matchApi.getInvitations(),
    enabled: !!user,
  });

  const swipeMutation = useMutation({
    mutationFn: ({ toUserId, action }: { toUserId: string; action: "like" | "pass" }) =>
      matchApi.swipe(toUserId, action),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["match-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["match-profiles"] });
      if (result.matched) {
        toast({ title: "It's a match! 🎉", description: "You can now chat with them." });
      }
    },
  });

  const handleInvitation = (toUserId: string, action: "like" | "pass") => {
    swipeMutation.mutate({ toUserId, action });
  };

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

        {/* Pending Invitations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent" />
              Pending Invitations
            </h3>
            {invitationsQuery.data?.invitations && (
              <Badge variant="secondary">{invitationsQuery.data.invitations.length}</Badge>
            )}
          </div>

          {invitationsQuery.data?.invitations && invitationsQuery.data.invitations.length > 0 ? (
            <div className="grid gap-4">
              {invitationsQuery.data.invitations.map((inv) => (
                <Card key={inv.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/30 border-accent/20">
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center shrink-0">
                      {inv.avatar ? (
                        <img src={inv.avatar} alt={inv.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-accent font-bold">{inv.name?.[0] || inv.username[0]}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">@{inv.username}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{inv.bio || "No bio yet"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-accent hover:bg-accent/90 text-white gap-1"
                      onClick={() => handleInvitation(inv.id, "like")}
                      disabled={swipeMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-muted-foreground hover:text-destructive gap-1"
                      onClick={() => handleInvitation(inv.id, "pass")}
                      disabled={swipeMutation.isPending}
                    >
                      <UserX className="h-4 w-4" />
                      Ignore
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 border-dashed bg-muted/10 flex flex-col items-center justify-center text-center opacity-60">
              <Ghost className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground italic text-center">No pending invitations. Start swiping!</p>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1">
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
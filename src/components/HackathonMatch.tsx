import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/TrustBadge";
import { Heart, X, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HackathonProfile {
  id: string;
  username: string;
  trustLevel: "bronze" | "silver" | "gold" | "platinum";
  skills: string[];
  location: string;
  experience: string;
  lookingFor: string;
  hackathon: string;
  bio: string;
}

const mockProfiles: HackathonProfile[] = [
  {
    id: "1",
    username: "@code_ninja_99",
    trustLevel: "gold",
    skills: ["React", "Node.js", "Python", "ML"],
    location: "Bengaluru, Karnataka",
    experience: "3+ years",
    lookingFor: "Backend Developer",
    hackathon: "TechCrunch Disrupt 2025",
    bio: "Passionate full-stack developer looking for a ML expert to build an AI-powered fintech solution!"
  },
  {
    id: "2",
    username: "@design_guru",
    trustLevel: "platinum",
    skills: ["Figma", "UI/UX", "Prototyping", "Branding"],
    location: "Mysore, Karnataka",
    experience: "2+ years",
    lookingFor: "Frontend Developer",
    hackathon: "Design Sprint 2025",
    bio: "Award-winning designer seeking creative developers to build beautiful, user-centric applications!"
  },
  {
    id: "3",
    username: "@data_wizard",
    trustLevel: "silver",
    skills: ["Python", "TensorFlow", "Analytics", "SQL"],
    location: "Hyderabad, TG",
    experience: "2+ years",
    lookingFor: "Product Manager",
    hackathon: "AI Hackathon 2024",
    bio: "Data scientist passionate about turning insights into impactful products. Let's solve real problems!"
  },
  {
    id: "4",
    username: "@blockchain_dev",
    trustLevel: "gold",
    skills: ["Solidity", "Web3", "React", "Smart Contracts"],
    location: "Amaravathi, AP",
    experience: "4+ years",
    lookingFor: "UI/UX Designer",
    hackathon: "Web3 Summit 2024",
    bio: "Building the future of decentralized finance. Need a creative designer to make DeFi accessible!"
  },
  {
    id: "5",
    username: "@mobile_master",
    trustLevel: "bronze",
    skills: ["React Native", "Flutter", "iOS", "Android"],
    location: "Kolkata, WB",
    experience: "1+ year",
    lookingFor: "Backend Developer",
    hackathon: "Mobile Innovation 2024",
    bio: "Fresh graduate excited about mobile development. Looking for experienced backend developers!"
  }
];

export function HackathonMatch() {
  const [currentAction, setCurrentAction] = useState<"like" | "pass" | null>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const { toast } = useToast();

  const currentProfile = mockProfiles[currentProfileIndex];

  const handleAction = (action: "like" | "pass") => {
    setCurrentAction(action);
    
    if (action === "like") {
      toast({
        title: "Match Sent! 🎉",
        description: `Your connection request has been sent to ${currentProfile.username}`,
      });
    } else {
      toast({
        title: "Finding Next Teammate",
        description: "Loading the next potential teammate...",
      });
    }
    
    // Simulate loading next profile
    setTimeout(() => {
      setCurrentAction(null);
      setCurrentProfileIndex((prev) => (prev + 1) % mockProfiles.length);
    }, 2000);
  };

  return (
    <Card className="p-6 max-w-md mx-auto shadow-medium animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Hackathon Match</h2>
      </div>

      <div className="space-y-4">
        {/* Profile Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold text-foreground">{currentProfile.username}</h3>
            <TrustBadge level={currentProfile.trustLevel} />
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{currentProfile.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{currentProfile.experience}</span>
            </div>
          </div>
        </div>

        {/* Hackathon Info */}
        <div className="p-3 bg-accent/10 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Looking for</p>
          <p className="font-semibold text-accent">{currentProfile.lookingFor}</p>
          <p className="text-xs text-muted-foreground mt-1">for {currentProfile.hackathon}</p>
        </div>

        {/* Skills */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {currentProfile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">About</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentProfile.bio}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
            onClick={() => handleAction("pass")}
            disabled={currentAction !== null}
          >
            <X className="h-5 w-5 text-destructive" />
            Pass
          </Button>
          <Button
            variant="accent"
            size="lg"
            className="flex-1"
            onClick={() => handleAction("like")}
            disabled={currentAction !== null}
          >
            <Heart className="h-5 w-5" />
            Connect
          </Button>
        </div>

        {currentAction && (
          <div className="text-center p-4 bg-primary/5 rounded-lg animate-bounce-in">
            <p className="text-sm text-primary font-medium">
              {currentAction === "like" ? "Match sent! " : "Finding next teammate..."}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Star, MessageCircle, Users, Trophy, Zap, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  skills: string[];
  rating: number;
  projects: number;
  avatar: string;
}

const mockTeamMembers: TeamMember[] = [
  { id: 1, name: "Kranthi K", role: "Frontend Developer", skills: ["React", "TypeScript", "UI/UX"], rating: 4.8, projects: 12, avatar: "AC" },
  { id: 2, name: "Sarah Kumar", role: "Backend Developer", skills: ["Node.js", "Python", "Database"], rating: 4.9, projects: 8, avatar: "SK" },
  { id: 3, name: "Krishna raj", role: "Designer", skills: ["Figma", "Photoshop", "Branding"], rating: 4.7, projects: 15, avatar: "MT" },
  { id: 4, name: "Emma Wilson", role: "Data Scientist", skills: ["Python", "ML", "Analytics"], rating: 4.6, projects: 6, avatar: "EW" },
  { id: 5, name: "Prateek khened", role: "DevOps Engineer", skills: ["AWS", "Docker", "CI/CD"], rating: 4.8, projects: 10, avatar: "JP" },
  { id: 6, name: "Md rahim", role: "Product Manager", skills: ["Strategy", "Analytics", "Leadership"], rating: 4.9, projects: 14, avatar: "LZ" },
];

interface FilledTeamMember {
  name: string;
  role: string;
  filled: boolean;
}

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface Team {
  name: string;
  members: FilledTeamMember[];
}


export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<FilledTeamMember[]>([
    { name: "", role: "", filled: false },
    { name: "", role: "", filled: false },
    { name: "", role: "", filled: false },
    { name: "", role: "", filled: false }
  ]);
  const [showMatches, setShowMatches] = useState(false);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<'basic' | 'members' | 'review'>('basic');

  const updateMember = (index: number, field: keyof FilledTeamMember, value: string | boolean) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleAddMember = (index: number) => {
    if (!members[index].name || !members[index].role) {
      toast({
        title: "Missing Information",
        description: "Please fill in both name and role before adding the member.",
        variant: "destructive",
      });
      return;
    }
    const member = members[index];
    updateMember(index, "name", member.name);
    updateMember(index, "role", member.role);
    updateMember(index, "filled", true);
    toast({
      title: "Member Added",
      description: `${members[index].name} has been added to your team!`,
    });
  };

  const handleFindMember = (index: number) => {
    setSelectedMemberIndex(index);
    setShowMatches(true);
  };

  const handleSelectMember = (memberData: TeamMember) => {
    if (selectedMemberIndex !== null) {
      const newMembers = [...members];
      newMembers[selectedMemberIndex] = {
        ...newMembers[selectedMemberIndex],
        name: memberData.name,
        role: memberData.role,
        filled: true,
      };
      setMembers(newMembers);
      setShowMatches(false);
      setSelectedMemberIndex(null);
      toast({
        title: "Member Added",
        description: `${memberData.name} has been added to your team!`,
      });
    }
  };

  const removeMember = (index: number) => {
    updateMember(index, "name", "");
    updateMember(index, "role", "");
    updateMember(index, "filled", false);
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    const filledMembers = members.filter(m => m.filled);
    if (filledMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one team member",
        variant: "destructive",
      });
      return;
    }

    const newTeam: Team = {
      name: teamName,
      members: filledMembers,
    };

    // Save to local storage
    const existingTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    localStorage.setItem("teams", JSON.stringify([...existingTeams, newTeam]));

    toast({
      title: "Team Created! Next Step is To Win!!!",
      description: `Team "${teamName}" has been created with ${filledMembers.length} members.`,
    });
    onOpenChange(false);
    setTeamName("");
    setMembers([
      { name: "", role: "", filled: false },
      { name: "", role: "", filled: false },
      { name: "", role: "", filled: false },
      { name: "", role: "", filled: false }
    ]);
    setCurrentStep('basic');
  };

  const nextStep = () => {
    if (currentStep === 'basic' && teamName.trim()) {
      setCurrentStep('members');
    } else if (currentStep === 'members') {
      setCurrentStep('review');
    }
  };

  const prevStep = () => {
    if (currentStep === 'review') {
      setCurrentStep('members');
    } else if (currentStep === 'members') {
      setCurrentStep('basic');
    }
  };

  const filledMembersCount = members.filter(m => m.filled).length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader className="space-y-4 pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Create Your Dream Team
            </DialogTitle>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between w-full max-w-md mx-auto">
              {[
                { step: 'basic', icon: Users, label: 'Basic Info' },
                { step: 'members', icon: Plus, label: 'Add Members' },
                { step: 'review', icon: CheckCircle, label: 'Review' }
              ].map((item, index) => (
                <div key={item.step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep === item.step 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : index < ['basic', 'members', 'review'].indexOf(currentStep)
                        ? 'bg-accent border-accent text-accent-foreground'
                        : 'border-border text-muted-foreground'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  {index < 2 && (
                    <div className={`h-0.5 w-16 mx-2 transition-all duration-300 ${
                      index < ['basic', 'members', 'review'].indexOf(currentStep) 
                        ? 'bg-accent' 
                        : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 'basic' && (
              <div className="space-y-6 animate-fade-in">
                <Card className="p-6 bg-card border-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Team Details</h3>
                        <p className="text-sm text-muted-foreground">Give your team an awesome name</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="team-name" className="text-base font-medium">Team Name</Label>
                      <Input
                        id="team-name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter an awesome team name..."
                        className="h-12 text-lg border-2 focus:border-primary transition-all duration-300"
                      />
                    </div>
                  </div>
                </Card>
                
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Button 
                      onClick={nextStep} 
                      disabled={!teamName.trim()}
                      size="lg"
                      className="px-8 bg-gradient-primary hover:shadow-medium transition-all duration-300"
                    >
                      Continue to Members
                      <Users className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Add Members */}
            {currentStep === 'members' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Build Team "{teamName}"</h3>
                  <p className="text-muted-foreground">Add up to 4 members to your team</p>
                </div>

                <div className="grid gap-4">
                  {members.map((member, index) => (
                    <Card key={index} className={`p-4 border-2 transition-all duration-300 hover:shadow-soft ${
                      member.filled ? 'bg-accent/10 border-accent' : 'hover:border-primary/50'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                              member.filled ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {member.filled ? <CheckCircle className="h-5 w-5" /> : index + 1}
                            </div>
                            <div>
                              <p className="font-medium">Member {index + 1}</p>
                              {member.filled && (
                                <p className="text-xs text-accent font-medium">Added to team</p>
                              )}
                            </div>
                          </div>
                          
                          {member.filled ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeMember(index)}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddMember(index)}
                                className="h-8 w-8 p-0 hover:bg-accent/10"
                                disabled={!member.name || !member.role}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFindMember(index)}
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {!member.filled && (
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              value={member.name}
                              onChange={(e) => updateMember(index, "name", e.target.value)}
                              placeholder="Member name"
                              className="border-2 focus:border-primary transition-all duration-300"
                            />
                            <Input
                              value={member.role}
                              onChange={(e) => updateMember(index, "role", e.target.value)}
                              placeholder="Role (e.g., Developer)"
                              className="border-2 focus:border-primary transition-all duration-300"
                            />
                          </div>
                        )}
                        
                        {member.filled && (
                          <div className="bg-background/50 rounded-lg p-3">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    className="bg-gradient-primary"
                    disabled={filledMembersCount === 0}
                  >
                    Review Team ({filledMembersCount}/4)
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 'review' && (
              <div className="space-y-6 animate-fade-in">
                <Card className="p-6 bg-card border-2">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{teamName}</h3>
                      <p className="text-muted-foreground">Ready to make an impact!</p>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Team Members ({filledMembersCount})</h4>
                    <div className="grid gap-3">
                      {members.filter(m => m.filled).map((member, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <CheckCircle className="h-5 w-5 text-accent" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Edit Members
                  </Button>
                  <Button 
                    onClick={handleCreateTeam}
                    size="lg"
                    className="px-8 bg-gradient-hero hover:shadow-medium transition-all duration-300"
                  >
                    Create Team
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Member Matches Dialog */}
      <Dialog open={showMatches} onOpenChange={setShowMatches}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Find Perfect Team Member</DialogTitle>
            <p className="text-muted-foreground">Browse and connect with talented individuals</p>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1">
            <div className="grid gap-4 md:grid-cols-2">
              {mockTeamMembers.map((member) => (
                <Card key={member.id} className="p-4 hover:shadow-medium transition-all duration-300 border-2 hover:border-primary/50">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{member.name}</h4>
                          <div className="flex items-center gap-1 text-sm bg-accent/10 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span className="font-medium">{member.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{member.role}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {member.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground font-medium">
                        {member.projects} projects completed
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 hover:bg-primary/10"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button 
                          size="sm"
                          className="h-8 bg-gradient-primary"
                          onClick={() => handleSelectMember(member)}
                        >
                          Add to Team
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
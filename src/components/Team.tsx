import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface FilledTeamMember {
  name: string;
  role: string;
  filled: boolean;
}

export interface Team {
  name: string;
  members: FilledTeamMember[];
}

export function Team() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const storedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    setTeams(storedTeams);
  }, []);

  const handleDelete = (index: number) => {
    const newTeams = [...teams];
    newTeams.splice(index, 1);
    setTeams(newTeams);
    localStorage.setItem("teams", JSON.stringify(newTeams));
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Past Teams</h3>
      <div className="space-y-3">
        {teams.length > 0 ? (
          teams.map((team, index) => (
            <div key={index} className="p-3 bg-background/50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium">{team.name}</p>
                <div className="text-sm text-muted-foreground">
                  {team.members.map((member, i) => (
                    <div key={i}>
                      {member.name} - {member.role}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => handleDelete(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No past teams to show.</p>
        )}
      </div>
    </Card>
  );
}

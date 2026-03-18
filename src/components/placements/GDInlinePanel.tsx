/**
 * GDInlinePanel.tsx
 *
 * Inline expandable panel for Group Discussion placement cards.
 * When a GD card is clicked, this panel slides open WITHIN the card
 * (not a modal, not a new page).
 *
 * Shows:
 * 1. A message explaining that live discussions happen in community
 * 2. A "Go to Community" button that navigates to /daily
 *
 * The panel does NOT replace the card — it expands below the card's
 * existing content. The card itself remains visible above.
 *
 * isOpen controlled by parent (PlacementExperienceCard).
 */

import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GDInlinePanelProps {
  isOpen: boolean;
}

export function GDInlinePanel({ isOpen }: GDInlinePanelProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
      }`}
    >
      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 space-y-3">
        <div className="flex items-center gap-2 text-accent">
          <MessageSquare className="h-5 w-5" />
          <h4 className="font-semibold">Join the conversation live</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Real discussions happen in real-time. Connect with RNSIT students and
          builders in the Camply community — ask questions, share experiences,
          and find your people.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => navigate("/daily")}
        >
          Go to Community →
        </Button>
      </div>
    </div>
  );
}

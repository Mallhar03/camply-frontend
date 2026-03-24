/**
 * PartnerTestCard.tsx
 *
 * Renders an ed-tech platform card for the Online Tests tab.
 * Each card shows: platform logo/initials, platform name, test title,
 * description, and TWO CTA buttons side by side.
 */

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartnerTest } from "@/services/placements";

interface PartnerTestCardProps {
  test: PartnerTest;
}

export function PartnerTestCard({ test }: PartnerTestCardProps) {
  const [logoError, setLogoError] = useState(false);

  const initials = test.platformName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Logo */}
        <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-accent/10 dark:bg-white/10 border flex items-center justify-center">
          {test.logoUrl && !logoError ? (
            <img
              src={test.logoUrl}
              alt={test.platformName}
              className="h-full w-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-lg font-bold text-accent dark:text-white">{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-accent dark:text-white uppercase tracking-wider">
              {test.platformName}
            </span>
            <h3 className="text-base font-bold text-foreground">{test.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {test.description}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          onClick={() => handleLink(test.testLink)}
        >
          <ExternalLink className="h-4 w-4" />
          Take Test
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1 gap-2"
          onClick={() => handleLink(test.registrationLink)}
        >
          <ExternalLink className="h-4 w-4" />
          Register Free
        </Button>
      </div>
    </Card>
  );
}

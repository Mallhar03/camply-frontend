/**
 * JobPostCard.tsx
 *
 * Renders a single job post card. Camply internal jobs have a
 * distinct visual treatment (accent border, "Camply" badge).
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Briefcase, MapPin, DollarSign, Sparkles, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job } from "@/services/placements";

interface JobPostCardProps {
  job: Job;
}

export function JobPostCard({ job }: JobPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const initials = job.companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleApply = () => {
    const mailtoHref = `mailto:${job.applyEmail}?subject=${encodeURIComponent(
      job.applySubject
    )}&body=${encodeURIComponent(
      "Hi Camply Team,\n\nI am interested in the " +
        job.role +
        " role.\n\nPlease find my resume attached.\n\nRegards,"
    )}`;
    window.open(mailtoHref, "_blank");
  };

  const renderDescription = (text: string) => {
    return text.split("\n").map((line, i) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }
        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }
      return (
        <p key={i} className="text-sm text-muted-foreground leading-relaxed min-h-[1rem]">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${
        job.source === "CAMPLY_INTERNAL" ? "border-l-4 border-l-primary" : ""
      }`}
    >
      {/* Hiring Badge for Camply Internal */}
      {job.source === "CAMPLY_INTERNAL" && (
        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
          We're Hiring
        </Badge>
      )}

      {/* Main Content */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-accent/10 border flex items-center justify-center">
            {job.companyLogo && !logoError ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="h-full w-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-lg font-bold text-accent">{initials}</span>
            )}
          </div>
          <div className="flex-1 pr-24">
            <h3 className="text-lg font-bold text-foreground leading-tight">
              {job.role}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span className="font-semibold text-accent">{job.companyName}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-xs bg-accent/5 px-2 py-1 rounded">
            <DollarSign className="h-3 w-3 text-accent" />
            <span className="text-foreground/80 font-medium">{job.compensationType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-accent/5 px-2 py-1 rounded">
            <Briefcase className="h-3 w-3 text-accent" />
            <span className="text-foreground/80 font-medium">{job.source === 'CAMPLY_INTERNAL' ? 'Internal' : 'Partner'}</span>
          </div>
        </div>

        {/* View Details Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline decoration-accent/50"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View Details & Apply <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>

        {/* Expanded Content */}
        <div
          className={`space-y-6 transition-all duration-300 overflow-hidden ${
            isExpanded ? "max-h-[2000px] opacity-100 pt-2" : "max-h-0 opacity-0"
          }`}
        >
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Role Description
            </h4>
            <div className="space-y-1">{renderDescription(job.description)}</div>
          </div>

          {/* Perks */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              Perks & Benefits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {job.perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-0.5">✦</span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Requirements
            </h4>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-accent mt-0.5">→</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compensation Note */}
          <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
            <h4 className="text-[10px] uppercase tracking-wider font-bold text-accent mb-1">
              Compensation Details
            </h4>
            <p className="text-xs text-muted-foreground">{job.compensationNote}</p>
          </div>

          {/* Apply Button */}
          <Button onClick={handleApply} className="w-full gap-2 py-6 text-base font-bold">
            <Mail className="h-5 w-5" />
            Apply Now
          </Button>
        </div>
      </div>
    </Card>
  );
}

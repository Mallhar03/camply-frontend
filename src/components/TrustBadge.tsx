import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  level: string;
  className?: string;
}

const badgeConfig = {
  bronze: {
    label: "Bronze",
    icon: "🥉",
    description: "New contributor"
  },
  silver: {
    label: "Silver", 
    icon: "🥈",
    description: "Active member"
  },
  gold: {
    label: "Gold",
    icon: "🥇", 
    description: "Trusted contributor"
  },
  platinum: {
    label: "Platinum",
    icon: "💎",
    description: "Elite member"
  }
};

export function TrustBadge({ level, className }: TrustBadgeProps) {
  const normalizedLevel = level?.toLowerCase() as "bronze" | "silver" | "gold" | "platinum";
  const config = badgeConfig[normalizedLevel] ?? badgeConfig.bronze;
  
  return (
    <Badge 
      variant="secondary"
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        level === "bronze" && "bg-badge-bronze/20 text-badge-bronze border-badge-bronze/30",
        normalizedLevel === "bronze" && "bg-badge-bronze/20 text-badge-bronze border-badge-bronze/30",
        normalizedLevel === "silver" && "bg-badge-silver/20 text-badge-silver border-badge-silver/30",
        normalizedLevel === "gold" && "bg-badge-gold/20 text-badge-gold border-badge-gold/30", 
        normalizedLevel === "platinum" && "bg-badge-platinum/20 text-badge-platinum border-badge-platinum/30",
        "animate-scale-in",
        className
      )}
    >
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
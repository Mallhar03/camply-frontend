import { Button } from "@/components/ui/button";
import { Home, Search, Heart, PlusSquare, User, Trophy, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  onTabChange: (tab: string) => void;
}

export const navItems = [
  { id: "feed", icon: Home, label: "Feed", href: "/" },
  { id: "post", icon: PlusSquare, label: "Post", href: "" },
  { id: "daily", icon: Trophy, label: "Daily", href: "/daily" },
  { id: "match", icon: Heart, label: "Match", href: "/match" },
  { id: "placements", icon: Briefcase, label: "Placements", href: "/placements" },
  { id: "profile", icon: User, label: "Profile", href: "/profile" }
];

export function Navigation({ onTabChange }: NavigationProps) {
  const location = useLocation();
  const activeTab = location.pathname === '/' ? 'feed' : location.pathname.substring(1);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3",
                activeTab === item.id && "text-primary"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className={cn(
                "h-6 w-6",
                activeTab === item.id && "fill-current"
              )} />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex-col z-40">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Camply</h1>
            </div>
            <ModeToggle />
          </div>
          
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  "w-full justify-start gap-3 h-12 flex items-center px-4 rounded-lg",
                  activeTab === item.id ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-base">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-auto p-6">
          <Link to="/login" className="w-full">
            <Button variant="hero" className="w-full">
              Join Network
            </Button>
          </Link>
        </div>
      </nav>
    </>
  );
}
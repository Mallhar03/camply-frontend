import { Button } from "@/components/ui/button";
import { Home, Heart, PlusSquare, User, Trophy, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
  onTabChange: (tab: string) => void;
}

export const navItems = [
  { id: "feed", icon: Home, label: "Feed", href: "/", requiresAuth: false },
  { id: "post", icon: PlusSquare, label: "Post", href: "", requiresAuth: true }, // modal trigger
  { id: "daily", icon: Trophy, label: "Daily", href: "/daily", requiresAuth: false },
  { id: "match", icon: Heart, label: "Match", href: "/match", requiresAuth: true },
  { id: "placements", icon: Briefcase, label: "Placements", href: "/placements", requiresAuth: false },
  { id: "profile", icon: User, label: "Profile", href: "/profile", requiresAuth: true },
];

export function Navigation({ onTabChange }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const activeTab = location.pathname === "/" ? "feed" : location.pathname.substring(1);

  const handleNavClick = (item: typeof navItems[0]) => {
    // If requires auth and not logged in → redirect to login
    if (item.requiresAuth && !isAuthenticated) {
      navigate("/login");
      return;
    }
    // "Post" has no href — it opens a modal via onTabChange
    onTabChange(item.id);
  };

  const renderNavItem = (item: typeof navItems[0], isMobile = false) => {
    const isActive = activeTab === item.id;
    const commonClass = isMobile
      ? cn("flex flex-col items-center gap-1 h-auto py-2 px-3", isActive && "text-primary")
      : cn(
        "w-full justify-start gap-3 h-12 flex items-center px-4 rounded-lg",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
      );

    const content = isMobile ? (
      <>
        <item.icon className={cn("h-6 w-6", isActive && "fill-current")} />
        <span className="text-xs">{item.label}</span>
      </>
    ) : (
      <>
        <item.icon className="h-6 w-6" />
        <span className="text-base">{item.label}</span>
      </>
    );

    // "Post" has no route — use a button to trigger modal
    if (item.id === "post") {
      return (
        <button key={item.id} className={commonClass} onClick={() => handleNavClick(item)}>
          {content}
        </button>
      );
    }

    return (
      <Link key={item.id} to={item.href} className={commonClass} onClick={() => handleNavClick(item)}>
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => renderNavItem(item, true))}
        </div>
      </nav>

      {/* Mobile Top Mode Toggle */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <ModeToggle />
      </div>

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
            {navItems.map((item) => renderNavItem(item, false))}
          </div>
        </div>

        {/* Bottom CTA — show login if not authed, profile if authed */}
        <div className="mt-auto p-6">
          {isAuthenticated ? (
            <Link to="/profile" className="w-full">
              <Button variant="outline" className="w-full">
                My Profile
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="w-full">
              <Button variant="hero" className="w-full">
                Join Network
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
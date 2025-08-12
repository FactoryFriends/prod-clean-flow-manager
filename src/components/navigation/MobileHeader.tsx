import { Settings, Receipt, Building, Menu, LogOut, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LocationSwitcher } from "@/components/LocationSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MobileHeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

const getSectionTitle = (section: string) => {
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    production: "Production",
    distribution: "Distribution",
    cleaning: "Cleaning Tasks",
    invoicing: "Invoicing",
    reports: "Reports",
    "recipe-management": "Recipe Management",
    settings: "Settings"
  };
  return titles[section] || "Dashboard";
};

export function MobileHeader({ activeSection, onSectionChange, currentLocation, onLocationChange }: MobileHeaderProps) {
  const { signOut, user, profile } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  const secondaryMenuItems = [
    ...(currentLocation === "tothai" ? [
      { id: "invoicing", label: "Invoicing", icon: Receipt },
      { id: "recipe-management", label: "Recipe Management", icon: Building }
    ] : []),
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Location & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <LocationSwitcher 
            currentLocation={currentLocation} 
            onLocationChange={onLocationChange}
          />
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-semibold truncate">
              {getSectionTitle(activeSection)}
            </h1>
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {currentLocation === "tothai" ? "ToThai" : "Khin"}
            </Badge>
          </div>
        </div>

        {/* Right: Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">
              {profile?.full_name || user?.email || 'User'}
            </div>
            <div className="px-2 py-1 text-xs text-muted-foreground">
              {profile?.role === 'admin' ? 'Administrator' : 'Production User'}
            </div>
            <DropdownMenuSeparator />
            
            {secondaryMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem 
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
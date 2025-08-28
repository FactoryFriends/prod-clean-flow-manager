import { Building, Package, Truck, Brush, BarChart3, Settings, Receipt, Menu, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", mobileLabel: "Home", icon: BarChart3, availableFor: ["tothai", "khin"] },
  { id: "production", label: "Production", mobileLabel: "Prod", icon: Package, availableFor: ["tothai"] },
  { id: "distribution", label: "Distribution", mobileLabel: "Distr", icon: Truck, availableFor: ["tothai"] },
  { id: "cleaning", label: "Cleaning Tasks", mobileLabel: "Clean", icon: Brush, availableFor: ["tothai", "khin"] },
  { id: "invoicing", label: "Invoicing", mobileLabel: "Invoice", icon: Receipt, availableFor: ["tothai"] },
  { id: "reports", label: "Reports", mobileLabel: "Reports", icon: FileText, availableFor: ["tothai", "khin"] },
  // Only show Recipe Management in ToThai location:
  { id: "recipe-management", label: "Recipe Management", mobileLabel: "Recipes", icon: Building, availableFor: ["tothai"] },
  { id: "settings", label: "Settings", mobileLabel: "Config", icon: Settings, availableFor: ["tothai", "khin"] },
];

export function Sidebar({ activeSection, onSectionChange, isCollapsed, onToggleCollapse, currentLocation, onLocationChange }: SidebarProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter menu items based on current location
  const availableMenuItems = menuItems.filter(item => 
    item.availableFor.includes(currentLocation)
  );

  // Get current user profile for role-based access
  
  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
            <img 
              src="/icon-192x192.png" 
              alt="OptiThai Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground">OptiThai</h1>
              <p className="text-sm text-sidebar-foreground/60">
                {isMobile ? "Hub" : "Production Hub"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Location switcher with brand colors */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex gap-1 bg-sidebar-accent/20 rounded-lg p-1">
            <button
              onClick={() => onLocationChange("tothai")}
              className={cn(
                "flex-1 text-xs py-3 px-3 rounded-md transition-colors touch-manipulation",
                "min-h-[44px] flex items-center justify-center font-medium",
                currentLocation === "tothai"
                  ? "bg-tothai-primary text-tothai-accent shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground active:bg-sidebar-accent/50"
              )}
            >
              ToThai
            </button>
            <button
              onClick={() => onLocationChange("khin")}
              className={cn(
                "flex-1 text-xs py-3 px-3 rounded-md transition-colors touch-manipulation",
                "min-h-[44px] flex items-center justify-center font-medium",
                currentLocation === "khin"
                  ? "bg-khin-primary text-khin-accent shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground active:bg-sidebar-accent/50"
              )}
            >
              KHIN
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1">
        <nav className="p-4 space-y-2">
          {availableMenuItems.map((item) => {
            const Icon = item.icon;
            const displayLabel = isMobile ? item.mobileLabel : item.label;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg transition-colors touch-manipulation",
                  "min-h-[48px] text-left",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "active:bg-sidebar-accent/80 active:scale-[0.98]",
                  activeSection === item.id 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(!isCollapsed || isMobile) && <span className="text-sm font-medium">{displayLabel}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile menu trigger - moved to right side */}
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-10 w-10 bg-background/80 backdrop-blur-sm border-border/50"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar">
              <div className="h-full bg-sidebar">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border h-screen transition-all duration-300 hidden md:block",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Desktop toggle button */}
      <div className="absolute -right-3 top-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleCollapse}
          className="h-6 w-6 rounded-full bg-background border-border/50"
        >
          {isCollapsed ? (
            <Menu className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      <SidebarContent />
    </div>
  );
}

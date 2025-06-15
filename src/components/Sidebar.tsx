
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
  { id: "dashboard", label: "Dashboard", icon: BarChart3, availableFor: ["tothai", "khin"] },
  { id: "production", label: "Production", icon: Package, availableFor: ["tothai"] },
  { id: "distribution", label: "Distribution", icon: Truck, availableFor: ["tothai"] },
  { id: "cleaning", label: "Cleaning Tasks", icon: Brush, availableFor: ["tothai", "khin"] },
  { id: "invoicing", label: "Invoicing", icon: Receipt, availableFor: ["tothai"] },
  { id: "reports", label: "Reports", icon: FileText, availableFor: ["tothai", "khin"] },
  { id: "settings", label: "Settings", icon: Settings, availableFor: ["tothai", "khin"] },
];

export function Sidebar({ activeSection, onSectionChange, isCollapsed, onToggleCollapse, currentLocation, onLocationChange }: SidebarProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter menu items based on current location
  const availableMenuItems = menuItems.filter(item => 
    item.availableFor.includes(currentLocation)
  );

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
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <img 
              src="/lovable-uploads/0de3c103-6c05-4b46-bf8c-8237a9815b6d.png" 
              alt="OptiThai Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground">OptiThai</h1>
              <p className="text-sm text-sidebar-foreground/60">Production Hub</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Location switcher */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex gap-1 bg-sidebar-accent/20 rounded-lg p-1">
            <button
              onClick={() => onLocationChange("tothai")}
              className={cn(
                "flex-1 text-xs py-3 px-3 rounded-md transition-colors touch-manipulation",
                "min-h-[44px] flex items-center justify-center",
                currentLocation === "tothai"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground active:bg-sidebar-accent/50"
              )}
            >
              ToThai
            </button>
            <button
              onClick={() => onLocationChange("khin")}
              className={cn(
                "flex-1 text-xs py-3 px-3 rounded-md transition-colors touch-manipulation",
                "min-h-[44px] flex items-center justify-center",
                currentLocation === "khin"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground active:bg-sidebar-accent/50"
              )}
            >
              KHIN
            </button>
          </div>
        </div>
      )}
      
      <nav className="p-4 space-y-2">
        {availableMenuItems.map((item) => {
          const Icon = item.icon;
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
              {(!isCollapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile menu trigger */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
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


import { Building, Package, Truck, Brush, BarChart3, Settings, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { id: "settings", label: "Settings", icon: Settings, availableFor: ["tothai", "khin"] },
];

export function Sidebar({ activeSection, onSectionChange, isCollapsed, onToggleCollapse, currentLocation, onLocationChange }: SidebarProps) {
  // Filter menu items based on current location
  const availableMenuItems = menuItems.filter(item => 
    item.availableFor.includes(currentLocation)
  );

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border h-screen transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <img 
              src="/lovable-uploads/0de3c103-6c05-4b46-bf8c-8237a9815b6d.png" 
              alt="OptiThai Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground">OptiThai</h1>
              <p className="text-sm text-sidebar-foreground/60">Production Hub</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Location switcher */}
      {!isCollapsed && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex gap-1 bg-sidebar-accent/20 rounded-lg p-1">
            <button
              onClick={() => onLocationChange("tothai")}
              className={cn(
                "flex-1 text-xs py-2 px-3 rounded-md transition-colors",
                currentLocation === "tothai"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              ToThai
            </button>
            <button
              onClick={() => onLocationChange("khin")}
              className={cn(
                "flex-1 text-xs py-2 px-3 rounded-md transition-colors",
                currentLocation === "khin"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
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
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                activeSection === item.id 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

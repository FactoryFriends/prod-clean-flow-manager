import { Building, ChefHat, Truck, Brush, Home, Settings, Receipt, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TopNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentLocation: "tothai" | "khin";
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, availableFor: ["tothai", "khin"] },
  { id: "production", label: "Production", icon: ChefHat, availableFor: ["tothai"] },
  { id: "distribution", label: "Distribution", icon: Truck, availableFor: ["tothai"] },
  { id: "cleaning", label: "Cleaning Tasks", icon: Brush, availableFor: ["tothai", "khin"] },
  { id: "invoicing", label: "Invoicing", icon: Receipt, availableFor: ["tothai"] },
  { id: "reports", label: "Reports", icon: FileText, availableFor: ["tothai", "khin"] },
  { id: "recipe-management", label: "Recipe Management", icon: Building, availableFor: ["tothai"] },
  { id: "settings", label: "Settings", icon: Settings, availableFor: ["tothai", "khin"] },
];

export function TopNavigation({ activeSection, onSectionChange, currentLocation }: TopNavigationProps) {
  // Filter menu items based on current location
  const availableMenuItems = menuItems.filter(item => 
    item.availableFor.includes(currentLocation)
  );

  return (
    <div className="flex items-center gap-1">
      {availableMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex items-center justify-center w-10 h-10",
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "hover:bg-accent"
                )}
              >
                <Icon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
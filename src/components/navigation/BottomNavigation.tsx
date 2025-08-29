import { Building, ChefHat, Truck, Brush, Home, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentLocation: "tothai" | "khin";
}

const primaryNavItems = [
  { id: "dashboard", label: "Home", icon: Home, availableFor: ["tothai", "khin"] },
  { id: "production", label: "Production", icon: ChefHat, availableFor: ["tothai"] },
  { id: "cleaning", label: "Cleaning", icon: Brush, availableFor: ["tothai", "khin"] },
  { id: "distribution", label: "Distribution", icon: Truck, availableFor: ["tothai"] },
  { id: "reports", label: "Reports", icon: FileText, availableFor: ["tothai", "khin"] },
];

export function BottomNavigation({ activeSection, onSectionChange, currentLocation }: BottomNavigationProps) {
  // Filter items based on current location and limit to 5 for bottom nav
  const availableItems = primaryNavItems.filter(item => 
    item.availableFor.includes(currentLocation)
  ).slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {availableItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center h-full px-3 py-2 rounded-lg transition-colors",
                "min-w-0 flex-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
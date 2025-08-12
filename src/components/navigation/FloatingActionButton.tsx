import { Plus, Package, ClipboardList, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  activeSection: string;
  onQuickAction: (action: string) => void;
  currentLocation: "tothai" | "khin";
}

export function FloatingActionButton({ activeSection, onQuickAction, currentLocation }: FloatingActionButtonProps) {
  // Only show FAB on certain sections and for ToThai location
  const showFAB = currentLocation === "tothai" && 
    ["dashboard", "production", "cleaning", "distribution"].includes(activeSection);

  if (!showFAB) return null;

  const quickActions = [
    { id: "new-batch", label: "New Production Batch", icon: Package, section: "production" },
    { id: "new-cleaning-task", label: "New Cleaning Task", icon: ClipboardList, section: "cleaning" },
    { id: "new-dispatch", label: "New Dispatch", icon: Truck, section: "distribution" },
  ];

  // Filter actions based on current section
  const relevantActions = quickActions.filter(action => 
    activeSection === "dashboard" || action.section === activeSection
  );

  if (relevantActions.length === 0) return null;

  // If only one action, show direct button
  if (relevantActions.length === 1) {
    const action = relevantActions[0];
    const Icon = action.icon;
    
    return (
      <Button
        onClick={() => onQuickAction(action.id)}
        size="lg"
        className={cn(
          "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg",
          "md:bottom-6 md:right-6",
          "hover:scale-105 transition-transform"
        )}
      >
        <Icon className="h-6 w-6" />
        <span className="sr-only">{action.label}</span>
      </Button>
    );
  }

  // Multiple actions - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className={cn(
            "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg",
            "md:bottom-6 md:right-6",
            "hover:scale-105 transition-transform"
          )}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Quick actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 mb-2">
        {relevantActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem 
              key={action.id}
              onClick={() => onQuickAction(action.id)}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
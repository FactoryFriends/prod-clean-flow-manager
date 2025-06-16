
import { Package, Truck, ClipboardList, ShieldCheck, ChefHat } from "lucide-react";

interface DashboardQuickActionsProps {
  // onSectionChange now allows `'reports:favv'` and `'distribution:internal'` as well!
  onSectionChange: (section: string) => void;
  currentLocation: string;
}

export function DashboardQuickActions({ onSectionChange, currentLocation }: DashboardQuickActionsProps) {
  // Map location IDs to database values
  const dbLocation = currentLocation === "location1" ? "tothai" : "khin";
  
  // Define all buttons
  const allButtons = [
    {
      id: 'production',
      onClick: () => onSectionChange('production'),
      className: "p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
      icon: Package,
      label: "New Production"
    },
    {
      id: 'distribution',
      onClick: () => onSectionChange('distribution'),
      className: "p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors",
      icon: Truck,
      label: "Pick Goods"
    },
    {
      id: 'cleaning',
      onClick: () => onSectionChange('cleaning'),
      className: "p-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors",
      icon: ClipboardList,
      label: "Cleaning Tasks"
    },
    {
      id: 'favv',
      onClick: () => onSectionChange('reports:favv'),
      className: "p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
      icon: ShieldCheck,
      label: "FAVV Compliance"
    },
    {
      id: 'internal',
      onClick: () => onSectionChange('distribution:internal'),
      className: "p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors",
      icon: ChefHat,
      label: "Internal Kitchen"
    }
  ];

  // Filter buttons based on location - only restrict for KHIN
  const visibleButtons = dbLocation === "khin" 
    ? allButtons.filter(button => button.id === 'favv' || button.id === 'cleaning')
    : allButtons; // Show all buttons for ToThai

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className={`grid gap-4 ${dbLocation === "khin" ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'}`}>
        {visibleButtons.map((button) => {
          const IconComponent = button.icon;
          return (
            <button 
              key={button.id}
              onClick={button.onClick}
              className={button.className}
            >
              <IconComponent className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{button.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

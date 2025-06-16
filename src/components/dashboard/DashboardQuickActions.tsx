
import { Package, Truck, ClipboardList, ShieldCheck, ChefHat } from "lucide-react";

interface DashboardQuickActionsProps {
  // onSectionChange now allows `'reports:favv'` as well!
  onSectionChange: (section: string) => void;
}

export function DashboardQuickActions({ onSectionChange }: DashboardQuickActionsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button 
          onClick={() => onSectionChange('production')}
          className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Package className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">New Production</span>
        </button>
        <button 
          onClick={() => onSectionChange('distribution')}
          className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Truck className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Pick Goods</span>
        </button>
        <button 
          onClick={() => onSectionChange('cleaning')}
          className="p-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
        >
          <ClipboardList className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Cleaning Tasks</span>
        </button>
        <button 
          onClick={() => onSectionChange('reports:favv')}
          className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <ShieldCheck className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">FAVV Compliance</span>
        </button>
        <button 
          onClick={() => {
            // Navigate to distribution page and set active tab to internal
            onSectionChange('distribution');
            // We'll need to modify the Distribution component to handle this
            setTimeout(() => {
              const internalTab = document.querySelector('[value="internal"]') as HTMLButtonElement;
              if (internalTab) {
                internalTab.click();
              }
            }, 100);
          }}
          className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ChefHat className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Internal Kitchen</span>
        </button>
      </div>
    </div>
  );
}

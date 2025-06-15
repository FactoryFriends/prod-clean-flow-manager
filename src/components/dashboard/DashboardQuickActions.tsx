
import { Package, Truck, ClipboardList, CheckCircle } from "lucide-react";

export function DashboardQuickActions() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => window.location.hash = '#production'}
          className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Package className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">New Production</span>
        </button>
        <button 
          onClick={() => window.location.hash = '#distribution'}
          className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Truck className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Pick Goods</span>
        </button>
        <button 
          onClick={() => window.location.hash = '#cleaning'}
          className="p-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors"
        >
          <ClipboardList className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Cleaning Tasks</span>
        </button>
        <button 
          onClick={() => window.location.hash = '#reports'}
          className="p-4 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
        >
          <CheckCircle className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">View Reports</span>
        </button>
      </div>
    </div>
  );
}

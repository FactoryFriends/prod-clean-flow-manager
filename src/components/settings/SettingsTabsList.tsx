
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  Package, 
  Coffee, 
  Users, 
  ClipboardList, 
  UserCheck, 
  Settings as SettingsIcon,
  Truck,
  TrendingUp,
  FileSpreadsheet,
  ChefHat,
  Shield,
  Building2,
  Cog
} from "lucide-react";

const settingsCategories = [
  {
    title: "Production & Inventory",
    tabs: [
      { value: "products", label: "Semi-finished", icon: Package },
      { value: "drinks", label: "Drinks", icon: Coffee },
      { value: "suppliers", label: "Suppliers", icon: Truck },
      { value: "chefs", label: "Chefs", icon: ChefHat },
    ]
  },
  {
    title: "Operations",
    tabs: [
      { value: "staff", label: "Staff", icon: Users },
      { value: "tasks", label: "Tasks", icon: ClipboardList },
      { value: "customers", label: "Customers", icon: UserCheck },
      { value: "favv", label: "FAVV", icon: Building2 },
    ]
  },
  {
    title: "System & Configuration",
    tabs: [
      { value: "users", label: "Users", icon: Shield },
      { value: "unit-options", label: "Units", icon: Cog },
      { value: "excel-import", label: "Import", icon: FileSpreadsheet },
      { value: "ingredient-margins", label: "Margins", icon: TrendingUp },
    ]
  }
];

export function SettingsTabsList() {
  return (
    <div className="space-y-6">
      {settingsCategories.map((category) => (
        <div key={category.title} className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {category.title}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {category.tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

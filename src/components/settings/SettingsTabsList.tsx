
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function SettingsTabsList() {
  return (
    <div className="space-y-6">
      {/* Production & Inventory */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Production & Inventory
        </h3>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/50">
          <TabsTrigger value="products" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Package className="w-5 h-5" />
            <span className="text-xs font-medium">Products</span>
          </TabsTrigger>
          <TabsTrigger value="drinks" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Coffee className="w-5 h-5" />
            <span className="text-xs font-medium">Drinks</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Truck className="w-5 h-5" />
            <span className="text-xs font-medium">Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="chefs" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ChefHat className="w-5 h-5" />
            <span className="text-xs font-medium">Chefs</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Operations */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Operations
        </h3>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/50">
          <TabsTrigger value="staff" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs font-medium">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <UserCheck className="w-5 h-5" />
            <span className="text-xs font-medium">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="favv" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-medium">FAVV</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* System & Configuration */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          System & Configuration
        </h3>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/50">
          <TabsTrigger value="users" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-medium">Users</span>
          </TabsTrigger>
          <TabsTrigger value="unit-options" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Cog className="w-5 h-5" />
            <span className="text-xs font-medium">Units</span>
          </TabsTrigger>
          <TabsTrigger value="excel-import" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-xs font-medium">Import/Export</span>
          </TabsTrigger>
          <TabsTrigger value="ingredient-margins" className="flex flex-col items-center gap-2 h-auto py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-medium">Margins</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}

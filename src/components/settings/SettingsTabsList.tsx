
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
  FileSpreadsheet
} from "lucide-react";

export function SettingsTabsList() {
  return (
    <div className="space-y-2">
      {/* First row - Core data management */}
      <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full">
        <TabsTrigger value="products" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span className="hidden sm:inline">Products</span>
        </TabsTrigger>
        <TabsTrigger value="drinks" className="flex items-center gap-2">
          <Coffee className="w-4 h-4" />
          <span className="hidden sm:inline">Drinks</span>
        </TabsTrigger>
        <TabsTrigger value="staff" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Staff</span>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          <span className="hidden sm:inline">Tasks</span>
        </TabsTrigger>
        <TabsTrigger value="customers" className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Customers</span>
        </TabsTrigger>
      </TabsList>

      {/* Second row - Configuration and tools */}
      <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full">
        <TabsTrigger value="favv" className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" />
          <span className="hidden sm:inline">FAVV</span>
        </TabsTrigger>
        <TabsTrigger value="suppliers" className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
          <span className="hidden sm:inline">Suppliers</span>
        </TabsTrigger>
        <TabsTrigger value="unit-options" className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Units</span>
        </TabsTrigger>
        <TabsTrigger value="excel-import" className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </TabsTrigger>
        <TabsTrigger value="ingredient-margins" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Margins</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

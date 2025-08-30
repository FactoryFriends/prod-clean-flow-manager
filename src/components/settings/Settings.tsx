import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsTabsList } from "@/components/settings/SettingsTabsList";
import { ProductsTab } from "@/components/settings/tabs/ProductsTab";
import { DrinksTab } from "@/components/settings/tabs/DrinksTab";
import { StaffTab } from "@/components/settings/tabs/StaffTab";
import { TasksTab } from "@/components/settings/tabs/TasksTab";
import { CustomersTab } from "@/components/settings/tabs/CustomersTab";
import { FAVVTab } from "@/components/settings/tabs/FAVVTab";
import { SettingsDialogs } from "@/components/settings/SettingsDialogs";
import { SystemInfo } from "@/components/settings/SystemInfo";
import { SuppliersTab } from "@/components/settings/tabs/SuppliersTab";
import { UsersTab } from "@/components/settings/tabs/UsersTab";
import IngredientPriceManager from "../reports/IngredientPriceManager";
import UnitOptionsSettings from "./UnitOptionsSettings";
import { UnitOptionsProvider } from "../shared/UnitOptionsContext";

interface SettingsProps {
  currentLocation: "tothai" | "khin";
}

export function Settings({ currentLocation }: SettingsProps) {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingStaffCode, setEditingStaffCode] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [staffCodeDialogOpen, setStaffCodeDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Filter states
  const [productFilter, setProductFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [drinkFilter, setDrinkFilter] = useState("");
  const [staffCodeFilter, setStaffCodeFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const handleEditStaffCode = (staffCode: any) => {
    setEditingStaffCode(staffCode);
    setStaffCodeDialogOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleProductSuccess = () => {
    setProductDialogOpen(false);
    setEditingProduct(null);
  };

  const handleStaffCodeSuccess = () => {
    setStaffCodeDialogOpen(false);
    setEditingStaffCode(null);
  };

  const handleTemplateSuccess = () => {
    setTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  };

  const handleAddNewDrink = () => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  };

  const handleAddNewStaffCode = () => {
    setEditingStaffCode(null);
    setStaffCodeDialogOpen(true);
  };

  const handleAddNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateDialogOpen(true);
  };

  return (
    <RoleGuard 
      allowedRoles={['admin']} 
      fallback={
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <div className="bg-card border border-border rounded-lg p-6 max-w-md">
            <p className="text-muted-foreground">
              Administrator access required to view settings.
            </p>
          </div>
        </div>
      }
    >
      <UnitOptionsProvider>
        <div className="space-y-6">
          <SettingsHeader 
            title="Settings" 
            description="Manage system configuration and data" 
          />
          <Tabs defaultValue="products" className="space-y-4">
            <SettingsTabsList />
            <ProductsTab
              productFilter={productFilter}
              setProductFilter={setProductFilter}
              productTypeFilter={productTypeFilter}
              setProductTypeFilter={setProductTypeFilter}
              onAddNewProduct={handleAddNewProduct}
              onEditProduct={handleEditProduct}
            />
            <DrinksTab
              drinkFilter={drinkFilter}
              setDrinkFilter={setDrinkFilter}
              onAddNewDrink={handleAddNewDrink}
              onEditProduct={handleEditProduct}
            />
            <StaffTab
              staffCodeFilter={staffCodeFilter}
              setStaffCodeFilter={setStaffCodeFilter}
              onAddNewStaffCode={handleAddNewStaffCode}
              onEditStaffCode={handleEditStaffCode}
            />
            <TasksTab
              templateFilter={templateFilter}
              setTemplateFilter={setTemplateFilter}
              onAddNewTemplate={handleAddNewTemplate}
              onEditTemplate={handleEditTemplate}
            />
            <CustomersTab
              customerFilter={customerFilter}
              setCustomerFilter={setCustomerFilter}
            />
            <FAVVTab currentLocation={currentLocation} />
            <SuppliersTab />
            <UsersTab />
            <TabsContent value="unit-options" className="space-y-4">
              <UnitOptionsSettings />
            </TabsContent>
            <TabsContent value="ingredient-margins" className="space-y-4">
              <IngredientPriceManager />
            </TabsContent>
          </Tabs>
          <SystemInfo currentLocation={currentLocation} />
          <SettingsDialogs
            productDialogOpen={productDialogOpen}
            setProductDialogOpen={setProductDialogOpen}
            editingProduct={editingProduct}
            handleProductSuccess={handleProductSuccess}
            staffCodeDialogOpen={staffCodeDialogOpen}
            setStaffCodeDialogOpen={setStaffCodeDialogOpen}
            editingStaffCode={editingStaffCode}
            handleStaffCodeSuccess={handleStaffCodeSuccess}
            templateDialogOpen={templateDialogOpen}
            setTemplateDialogOpen={setTemplateDialogOpen}
            editingTemplate={editingTemplate}
            handleTemplateSuccess={handleTemplateSuccess}
          />
        </div>
      </UnitOptionsProvider>
    </RoleGuard>
  );
}

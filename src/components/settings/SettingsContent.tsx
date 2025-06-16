
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SettingsTabsList } from "@/components/settings/SettingsTabsList";
import { ProductsTab } from "@/components/settings/tabs/ProductsTab";
import { DrinksTab } from "@/components/settings/tabs/DrinksTab";
import { StaffTab } from "@/components/settings/tabs/StaffTab";
import { TasksTab } from "@/components/settings/tabs/TasksTab";
import { CustomersTab } from "@/components/settings/tabs/CustomersTab";
import { FAVVTab } from "@/components/settings/tabs/FAVVTab";
import { SuppliersTab } from "@/components/settings/tabs/SuppliersTab";
import IngredientPriceManager from "../reports/IngredientPriceManager";
import UnitOptionsSettings from "./UnitOptionsSettings";

interface SettingsContentProps {
  currentLocation: "tothai" | "khin";
  productFilter: string;
  setProductFilter: (filter: string) => void;
  drinkFilter: string;
  setDrinkFilter: (filter: string) => void;
  staffCodeFilter: string;
  setStaffCodeFilter: (filter: string) => void;
  templateFilter: string;
  setTemplateFilter: (filter: string) => void;
  customerFilter: string;
  setCustomerFilter: (filter: string) => void;
  onEditProduct: (product: any) => void;
  onEditStaffCode: (staffCode: any) => void;
  onEditTemplate: (template: any) => void;
  onAddNewProduct: () => void;
  onAddNewDrink: () => void;
  onAddNewStaffCode: () => void;
  onAddNewTemplate: () => void;
}

export function SettingsContent({
  currentLocation,
  productFilter,
  setProductFilter,
  drinkFilter,
  setDrinkFilter,
  staffCodeFilter,
  setStaffCodeFilter,
  templateFilter,
  setTemplateFilter,
  customerFilter,
  setCustomerFilter,
  onEditProduct,
  onEditStaffCode,
  onEditTemplate,
  onAddNewProduct,
  onAddNewDrink,
  onAddNewStaffCode,
  onAddNewTemplate,
}: SettingsContentProps) {
  return (
    <Tabs defaultValue="products" className="space-y-4">
      <SettingsTabsList />
      <ProductsTab
        productFilter={productFilter}
        setProductFilter={setProductFilter}
        onAddNewProduct={onAddNewProduct}
        onEditProduct={onEditProduct}
      />
      <DrinksTab
        drinkFilter={drinkFilter}
        setDrinkFilter={setDrinkFilter}
        onAddNewDrink={onAddNewDrink}
        onEditProduct={onEditProduct}
      />
      <StaffTab
        staffCodeFilter={staffCodeFilter}
        setStaffCodeFilter={setStaffCodeFilter}
        onAddNewStaffCode={onAddNewStaffCode}
        onEditStaffCode={onEditStaffCode}
      />
      <TasksTab
        templateFilter={templateFilter}
        setTemplateFilter={setTemplateFilter}
        onAddNewTemplate={onAddNewTemplate}
        onEditTemplate={onEditTemplate}
      />
      <CustomersTab
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
      />
      <FAVVTab currentLocation={currentLocation} />
      <SuppliersTab />
      <TabsContent value="unit-options" className="space-y-4">
        <UnitOptionsSettings />
      </TabsContent>
      <TabsContent value="ingredient-margins" className="space-y-4">
        <IngredientPriceManager />
      </TabsContent>
    </Tabs>
  );
}

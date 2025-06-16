
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SettingsTabsList } from "@/components/settings/SettingsTabsList";
import { ProductsTab } from "@/components/settings/tabs/ProductsTab";
import { DrinksTab } from "@/components/settings/tabs/DrinksTab";
import { StaffTab } from "@/components/settings/tabs/StaffTab";
import { TasksTab } from "@/components/settings/tabs/TasksTab";
import { CustomersTab } from "@/components/settings/tabs/CustomersTab";
import { FAVVTab } from "@/components/settings/tabs/FAVVTab";
import { SuppliersTab } from "@/components/settings/tabs/SuppliersTab";
import { ExcelImport } from "@/components/settings/ExcelImport";
import IngredientPriceManager from "@/components/reports/IngredientPriceManager";
import UnitOptionsSettings from "@/components/settings/UnitOptionsSettings";
import { useSettingsHandlers } from "./hooks/useSettingsHandlers";

interface SettingsContentProps {
  currentLocation: "tothai" | "khin";
}

export function SettingsContent({ currentLocation }: SettingsContentProps) {
  const {
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
    handlers,
  } = useSettingsHandlers();

  return (
    <Tabs defaultValue="products" className="space-y-4">
      <SettingsTabsList />

      <ProductsTab
        productFilter={productFilter}
        setProductFilter={setProductFilter}
        onAddNewProduct={handlers.handleAddNewProduct}
        onEditProduct={handlers.handleEditProduct}
      />

      <DrinksTab
        drinkFilter={drinkFilter}
        setDrinkFilter={setDrinkFilter}
        onAddNewDrink={handlers.handleAddNewDrink}
        onEditProduct={handlers.handleEditProduct}
      />

      <StaffTab
        staffCodeFilter={staffCodeFilter}
        setStaffCodeFilter={setStaffCodeFilter}
        onAddNewStaffCode={handlers.handleAddNewStaffCode}
        onEditStaffCode={handlers.handleEditStaffCode}
      />

      <TasksTab
        templateFilter={templateFilter}
        setTemplateFilter={setTemplateFilter}
        onAddNewTemplate={handlers.handleAddNewTemplate}
        onEditTemplate={handlers.handleEditTemplate}
      />

      <CustomersTab
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
      />

      <FAVVTab currentLocation={currentLocation} />

      <SuppliersTab />

      <TabsContent value="excel-import" className="space-y-4">
        <ExcelImport />
      </TabsContent>

      <TabsContent value="unit-options" className="space-y-4">
        <UnitOptionsSettings />
      </TabsContent>

      <TabsContent value="ingredient-margins" className="space-y-4">
        <IngredientPriceManager />
      </TabsContent>
    </Tabs>
  );
}

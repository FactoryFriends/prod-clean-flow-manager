
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsTabsList() {
  return (
    <TabsList>
      <TabsTrigger value="products">Products</TabsTrigger>
      <TabsTrigger value="drinks">Drinks</TabsTrigger>
      <TabsTrigger value="staff">Staff</TabsTrigger>
      <TabsTrigger value="tasks">Tasks</TabsTrigger>
      <TabsTrigger value="customers">Customers</TabsTrigger>
      <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
      <TabsTrigger value="unit-options">Unit Options</TabsTrigger>
      <TabsTrigger value="ingredient-margins">Ingredient Cost</TabsTrigger>
    </TabsList>
  );
}


import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export function SettingsTabsList() {
  const isMobile = useIsMobile();

  return (
    <TabsList className="grid w-full grid-cols-7">
      <TabsTrigger value="products">{isMobile ? "Food" : "Food Products"}</TabsTrigger>
      <TabsTrigger value="drinks">{isMobile ? "Drinks" : "Drinks"}</TabsTrigger>
      <TabsTrigger value="staff">{isMobile ? "Staff" : "Staff Codes"}</TabsTrigger>
      <TabsTrigger value="tasks">{isMobile ? "Tasks" : "Task Templates"}</TabsTrigger>
      <TabsTrigger value="customers">{isMobile ? "Cust" : "Customers"}</TabsTrigger>
      {/* REMOVED: <TabsTrigger value="favv">FAVV</TabsTrigger> */}
      <TabsTrigger value="suppliers">{isMobile ? "Supp" : "Suppliers"}</TabsTrigger>
      <TabsTrigger value="ingredient-margins">{isMobile ? "Margins" : "Ingredient Margins"}</TabsTrigger>
    </TabsList>
  );
}

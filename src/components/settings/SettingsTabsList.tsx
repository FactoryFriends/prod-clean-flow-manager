
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export function SettingsTabsList() {
  const isMobile = useIsMobile();

  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="products">{isMobile ? "Prod" : "Products"}</TabsTrigger>
      <TabsTrigger value="staff">{isMobile ? "Staff" : "Staff Codes"}</TabsTrigger>
      <TabsTrigger value="tasks">{isMobile ? "Tasks" : "Task Templates"}</TabsTrigger>
      <TabsTrigger value="customers">{isMobile ? "Cust" : "Customers"}</TabsTrigger>
      <TabsTrigger value="favv">FAVV</TabsTrigger>
    </TabsList>
  );
}

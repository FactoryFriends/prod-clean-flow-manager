
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsTabsList() {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="products">Products</TabsTrigger>
      <TabsTrigger value="staff">Staff Codes</TabsTrigger>
      <TabsTrigger value="tasks">Task Templates</TabsTrigger>
      <TabsTrigger value="customers">Customers</TabsTrigger>
      <TabsTrigger value="favv">FAVV</TabsTrigger>
    </TabsList>
  );
}

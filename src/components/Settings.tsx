
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductList } from "./settings/ProductList";
import { StaffCodeList } from "./settings/StaffCodeList";
import { StaffCodeForm } from "./settings/StaffCodeForm";
import { TaskTemplateList } from "./settings/TaskTemplateList";
import { TaskTemplateForm } from "./settings/TaskTemplateForm";
import { ProductForm } from "./settings/ProductForm";
import { SystemInfo } from "./settings/SystemInfo";
import { AuditTrail } from "./settings/AuditTrail";
import { CustomerManagement } from "./settings/CustomerManagement";
import { SettingsAuth } from "./settings/SettingsAuth";

export function Settings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingStaffCode, setEditingStaffCode] = useState<any>(null);

  if (!isAuthenticated) {
    return <SettingsAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your kitchen operations and system settings
        </p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="staff">Staff Codes</TabsTrigger>
          <TabsTrigger value="tasks">Task Templates</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <ProductForm />
          <ProductList />
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <StaffCodeForm 
            staffCode={editingStaffCode} 
            onSuccess={() => setEditingStaffCode(null)}
          />
          <StaffCodeList onEditStaffCode={setEditingStaffCode} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TaskTemplateForm />
          <TaskTemplateList />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerManagement />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemInfo />
        </TabsContent>
      </Tabs>
    </div>
  );
}

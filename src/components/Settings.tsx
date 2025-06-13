
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "./settings/ProductForm";
import { ProductList } from "./settings/ProductList";
import { StaffCodeForm } from "./settings/StaffCodeForm";
import { StaffCodeList } from "./settings/StaffCodeList";
import { TaskTemplateForm } from "./settings/TaskTemplateForm";
import { TaskTemplateList } from "./settings/TaskTemplateList";
import { CustomerManagement } from "./settings/CustomerManagement";
import { AuditTrail } from "./settings/AuditTrail";
import { SystemInfo } from "./settings/SystemInfo";
import { SettingsAuth } from "./settings/SettingsAuth";

interface SettingsProps {
  currentLocation: "tothai" | "khin";
}

export function Settings({ currentLocation }: SettingsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingStaffCode, setEditingStaffCode] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [staffCodeDialogOpen, setStaffCodeDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  if (!isAuthenticated) {
    return <SettingsAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and data</p>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="staff">Staff Codes</TabsTrigger>
          <TabsTrigger value="tasks">Task Templates</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage products and their specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductList onEditProduct={handleEditProduct} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Code Management</CardTitle>
              <CardDescription>Manage staff codes and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <StaffCodeList onEditStaffCode={handleEditStaffCode} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Template Management</CardTitle>
              <CardDescription>Manage cleaning task templates</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskTemplateList onEditTemplate={handleEditTemplate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <CustomerManagement />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>View system activity and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <AuditTrail />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SystemInfo currentLocation={currentLocation} />

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            editingProduct={editingProduct}
            onSuccess={handleProductSuccess}
            onCancel={() => setProductDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Staff Code Dialog */}
      <Dialog open={staffCodeDialogOpen} onOpenChange={setStaffCodeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStaffCode ? "Edit Staff Code" : "Add New Staff Code"}</DialogTitle>
          </DialogHeader>
          <StaffCodeForm 
            editingStaffCode={editingStaffCode}
            onSuccess={handleStaffCodeSuccess}
            onCancel={() => setStaffCodeDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Add New Template"}</DialogTitle>
          </DialogHeader>
          <TaskTemplateForm 
            editingTemplate={editingTemplate}
            onSuccess={handleTemplateSuccess}
            onCancel={() => setTemplateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

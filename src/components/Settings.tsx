import { useState } from "react";
import { Plus, Package, ClipboardList, Users, Settings as SettingsIcon, UserCheck, Truck, ChefHat, Contact, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SettingsAuth } from "./settings/SettingsAuth";
import { TaskTemplateForm } from "./settings/TaskTemplateForm";
import { TaskTemplateList } from "./settings/TaskTemplateList";
import { ProductForm } from "./settings/ProductForm";
import { ProductList } from "./settings/ProductList";
import { StaffCodeForm } from "./settings/StaffCodeForm";
import { StaffCodeList } from "./settings/StaffCodeList";
import { SystemInfo } from "./settings/SystemInfo";
import { ManagerPasscodeForm } from "./settings/ManagerPasscodeForm";
import { AuditTrail } from "./settings/AuditTrail";
import { Product } from "@/hooks/useProductionData";

interface SettingsProps {
  currentLocation: string;
}

export function Settings({ currentLocation }: SettingsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [showNewStaffCodeDialog, setShowNewStaffCodeDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStaffCode, setEditingStaffCode] = useState<any>(null);

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setShowNewTaskDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowNewProductDialog(true);
  };

  const handleEditStaffCode = (staffCode: any) => {
    setEditingStaffCode(staffCode);
    setShowNewStaffCodeDialog(true);
  };

  const handleTaskFormSuccess = () => {
    setShowNewTaskDialog(false);
    setEditingTemplate(null);
  };

  const handleTaskFormCancel = () => {
    setShowNewTaskDialog(false);
    setEditingTemplate(null);
  };

  const handleProductFormSuccess = () => {
    setShowNewProductDialog(false);
    setEditingProduct(null);
  };

  const handleProductFormCancel = () => {
    setShowNewProductDialog(false);
    setEditingProduct(null);
  };

  const handleStaffCodeFormSuccess = () => {
    setShowNewStaffCodeDialog(false);
    setEditingStaffCode(null);
  };

  const handleStaffCodeFormCancel = () => {
    setShowNewStaffCodeDialog(false);
    setEditingStaffCode(null);
  };

  if (!isAuthenticated) {
    return <SettingsAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Manager Settings</h1>
        <Button 
          variant="outline" 
          onClick={() => setIsAuthenticated(false)}
          className="text-sm"
        >
          Lock Settings
        </Button>
      </div>

      <Tabs defaultValue="master-data" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="master-data" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Master Data
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="staff-external" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Staff & External
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="master-data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" />
                Master Data Management
              </CardTitle>
              <CardDescription>
                Manage products, suppliers, and core business data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Products Management */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Self-Made Products</h3>
                      <p className="text-sm text-muted-foreground">Manage products made in-house with shelf life and pricing</p>
                    </div>
                  </div>
                  
                  <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? "Edit Product" : "Create New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <ProductForm
                        editingProduct={editingProduct}
                        onSuccess={handleProductFormSuccess}
                        onCancel={handleProductFormCancel}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <ProductList onEditProduct={handleEditProduct} />
              </div>

              {/* External Products & Suppliers - Placeholder */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">External Products & Suppliers</h3>
                    <p className="text-sm text-muted-foreground">Manage external products and supplier relationships</p>
                  </div>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Coming soon - External products and suppliers management</p>
                </div>
              </div>

              {/* Customers - Placeholder */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Contact className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Customers</h3>
                    <p className="text-sm text-muted-foreground">Manage customer information and relationships</p>
                  </div>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Coming soon - Customer management</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-primary" />
                Operations Management
              </CardTitle>
              <CardDescription>
                Configure cleaning tasks, schedules, and operational procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Task Templates */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Task Templates</h3>
                      <p className="text-sm text-muted-foreground">Define recurring cleaning and maintenance tasks</p>
                    </div>
                  </div>
                  
                  <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Task Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTemplate ? "Edit Task Template" : "Create New Task Template"}
                        </DialogTitle>
                      </DialogHeader>
                      <TaskTemplateForm
                        editingTemplate={editingTemplate}
                        onSuccess={handleTaskFormSuccess}
                        onCancel={handleTaskFormCancel}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <TaskTemplateList onEditTemplate={handleEditTemplate} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff-external" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Staff & External Management
              </CardTitle>
              <CardDescription>
                Manage staff codes, chef assignments, and external contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Staff Codes Management */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Staff Codes</h3>
                      <p className="text-sm text-muted-foreground">Manage staff access codes and permissions</p>
                    </div>
                  </div>

                  <Dialog open={showNewStaffCodeDialog} onOpenChange={setShowNewStaffCodeDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Staff Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingStaffCode ? "Edit Staff Code" : "Create New Staff Code"}
                        </DialogTitle>
                      </DialogHeader>
                      <StaffCodeForm
                        editingStaffCode={editingStaffCode}
                        onSuccess={handleStaffCodeFormSuccess}
                        onCancel={handleStaffCodeFormCancel}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <StaffCodeList onEditStaffCode={handleEditStaffCode} />
              </div>

              {/* Chefs Management - Placeholder */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <ChefHat className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Chefs Management</h3>
                    <p className="text-sm text-muted-foreground">Manage chef assignments and responsibilities</p>
                  </div>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Coming soon - Chefs management</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Compliance & Audit
              </CardTitle>
              <CardDescription>
                FAVV compliance tracking and complete audit trail for food safety
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audit Trail */}
              <div className="border border-border rounded-lg p-4">
                <AuditTrail />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-primary" />
                System Configuration
              </CardTitle>
              <CardDescription>
                System settings, security, and configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Manager Passcode Management */}
              <div className="border border-border rounded-lg p-4">
                <ManagerPasscodeForm />
              </div>

              {/* System Information */}
              <div className="border border-border rounded-lg p-4">
                <SystemInfo currentLocation={currentLocation} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

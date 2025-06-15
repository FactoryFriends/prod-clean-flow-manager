
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ProductForm } from "./settings/ProductForm";
import { ProductList } from "./settings/ProductList";
import { StaffCodeForm } from "./settings/StaffCodeForm";
import { StaffCodeList } from "./settings/StaffCodeList";
import { TaskTemplateForm } from "./settings/TaskTemplateForm";
import { TaskTemplateList } from "./settings/TaskTemplateList";
import { CustomerManagement } from "./settings/CustomerManagement";
import { CustomerForm } from "./settings/CustomerForm";
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
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  
  // Filter states
  const [productFilter, setProductFilter] = useState("");
  const [staffCodeFilter, setStaffCodeFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [auditFilter, setAuditFilter] = useState("");

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

  const handleCustomerSuccess = () => {
    setCustomerDialogOpen(false);
  };

  const handleAddNewProduct = () => {
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

  const handleAddNewCustomer = () => {
    setCustomerDialogOpen(true);
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage products and their specifications</CardDescription>
                </div>
                <Button onClick={handleAddNewProduct} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Filter products..."
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ProductList onEditProduct={handleEditProduct} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Code Management</CardTitle>
                  <CardDescription>Manage staff codes and permissions</CardDescription>
                </div>
                <Button onClick={handleAddNewStaffCode} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Staff Code
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Filter staff codes..."
                  value={staffCodeFilter}
                  onChange={(e) => setStaffCodeFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <StaffCodeList onEditStaffCode={handleEditStaffCode} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Task Template Management</CardTitle>
                  <CardDescription>Manage cleaning task templates</CardDescription>
                </div>
                <Button onClick={handleAddNewTemplate} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Filter templates..."
                  value={templateFilter}
                  onChange={(e) => setTemplateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <TaskTemplateList onEditTemplate={handleEditTemplate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Management</CardTitle>
                  <CardDescription>Manage customer information and delivery details</CardDescription>
                </div>
                <Button onClick={handleAddNewCustomer} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Customer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Filter customers..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <CustomerManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>View system activity and changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Filter audit logs..."
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
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

      {/* Customer Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm onSuccess={handleCustomerSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

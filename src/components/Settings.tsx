
import { useState } from "react";
import { Plus, Package, ClipboardList, Users, Settings as SettingsIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { SettingsAuth } from "./settings/SettingsAuth";
import { TaskTemplateForm } from "./settings/TaskTemplateForm";
import { TaskTemplateList } from "./settings/TaskTemplateList";
import { ProductForm } from "./settings/ProductForm";
import { ProductList } from "./settings/ProductList";
import { SystemInfo } from "./settings/SystemInfo";
import { Product } from "@/hooks/useProductionData";

interface SettingsProps {
  currentLocation: string;
}

export function Settings({ currentLocation }: SettingsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setShowNewTaskDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowNewProductDialog(true);
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

      {/* Master Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            Master Data Management
          </CardTitle>
          <CardDescription>
            Manage products, suppliers, staff, and other core business data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Products Management */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Products</h3>
                  <p className="text-sm text-muted-foreground">Manage self-made products and their properties</p>
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
        </CardContent>
      </Card>

      {/* Operations Management Section */}
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

      {/* System Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-primary" />
            System Information
          </CardTitle>
          <CardDescription>
            Current system status and configuration details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemInfo currentLocation={currentLocation} />
        </CardContent>
      </Card>
    </div>
  );
}

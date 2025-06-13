
import { useState } from "react";
import { Plus, Package, ClipboardList } from "lucide-react";
import { Button } from "./ui/button";
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

      <div className="grid grid-cols-1 gap-6">
        {/* Products Management */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Products</h2>
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

          <div className="space-y-4">
            <ProductList onEditProduct={handleEditProduct} />
          </div>
        </div>

        {/* Task Templates */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Task Templates</h2>
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

          <div className="space-y-4">
            <TaskTemplateList onEditTemplate={handleEditTemplate} />
          </div>
        </div>

        <SystemInfo currentLocation={currentLocation} />
      </div>
    </div>
  );
}

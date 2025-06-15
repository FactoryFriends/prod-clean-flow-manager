
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { StaffCodeForm } from "./StaffCodeForm";
import { TaskTemplateForm } from "./TaskTemplateForm";

interface SettingsDialogsProps {
  // Product dialog
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  editingProduct: any;
  handleProductSuccess: () => void;
  
  // Staff code dialog
  staffCodeDialogOpen: boolean;
  setStaffCodeDialogOpen: (open: boolean) => void;
  editingStaffCode: any;
  handleStaffCodeSuccess: () => void;
  
  // Template dialog
  templateDialogOpen: boolean;
  setTemplateDialogOpen: (open: boolean) => void;
  editingTemplate: any;
  handleTemplateSuccess: () => void;
}

export function SettingsDialogs({
  productDialogOpen,
  setProductDialogOpen,
  editingProduct,
  handleProductSuccess,
  staffCodeDialogOpen,
  setStaffCodeDialogOpen,
  editingStaffCode,
  handleStaffCodeSuccess,
  templateDialogOpen,
  setTemplateDialogOpen,
  editingTemplate,
  handleTemplateSuccess,
}: SettingsDialogsProps) {
  return (
    <>
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
    </>
  );
}

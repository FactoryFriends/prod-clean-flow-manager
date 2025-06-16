
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { StaffCodeForm } from "./StaffCodeForm";
import { TaskTemplateForm } from "./TaskTemplateForm";
import { DrinkForm } from "../drinks/DrinkForm";

interface SettingsDialogsProps {
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  editingProduct: any;
  handleProductSuccess: () => void;
  staffCodeDialogOpen: boolean;
  setStaffCodeDialogOpen: (open: boolean) => void;
  editingStaffCode: any;
  handleStaffCodeSuccess: () => void;
  templateDialogOpen: boolean;
  setTemplateDialogOpen: (open: boolean) => void;
  editingTemplate: any;
  handleTemplateSuccess: () => void;
  drinkDialogOpen?: boolean;
  setDrinkDialogOpen?: (open: boolean) => void;
  handleDrinkSuccess?: () => void;
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
  drinkDialogOpen = false,
  setDrinkDialogOpen = () => {},
  handleDrinkSuccess = () => {},
}: SettingsDialogsProps) {
  return (
    <>
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSuccess={handleProductSuccess}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={drinkDialogOpen} onOpenChange={setDrinkDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Drink</DialogTitle>
          </DialogHeader>
          <DrinkForm />
        </DialogContent>
      </Dialog>

      <Dialog open={staffCodeDialogOpen} onOpenChange={setStaffCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaffCode ? "Edit Staff Code" : "Add New Staff Code"}
            </DialogTitle>
          </DialogHeader>
          <StaffCodeForm
            staffCode={editingStaffCode}
            onSuccess={handleStaffCodeSuccess}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Add New Template"}
            </DialogTitle>
          </DialogHeader>
          <TaskTemplateForm
            template={editingTemplate}
            onSuccess={handleTemplateSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

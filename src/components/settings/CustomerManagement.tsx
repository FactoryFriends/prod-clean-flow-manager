
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomerForm } from "./CustomerForm";
import { CustomerList } from "./CustomerList";

export function CustomerManagement() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleAddSuccess = () => {
    setAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Management</h2>
          <p className="text-muted-foreground">
            Manage customers and delivery destinations for dispatched products
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      <CustomerList />

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

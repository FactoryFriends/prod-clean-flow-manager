
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { format } from "date-fns";
import { useCustomers } from "@/hooks/useCustomers";
import { PackingSlipPreview } from "./packing-slip/PackingSlipPreview";
import { PackingSlipActions } from "./packing-slip/PackingSlipActions";

interface SelectedItem {
  id: string;
  type: 'batch' | 'external';
  name: string;
  batchNumber?: string;
  selectedQuantity: number;
  productionDate?: string;
}

interface PackingSlipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: SelectedItem[];
  customer: string;
  preparedBy: string;
  pickedUpBy: string;
  dispatchNotes: string;
  currentLocation: "tothai" | "khin";
}

export function PackingSlipDialog({
  open,
  onOpenChange,
  selectedItems,
  customer,
  preparedBy,
  pickedUpBy,
  dispatchNotes,
  currentLocation,
}: PackingSlipDialogProps) {
  const { data: customers = [] } = useCustomers(true);

  const generatePackingSlipNumber = () => {
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `PS-${date}-${random}`;
  };

  const getDestination = () => {
    const selectedCustomer = customers.find(c => c.id === customer);
    return selectedCustomer || null;
  };

  const totalItems = selectedItems.length;
  const totalPackages = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);

  const packingSlipNumber = generatePackingSlipNumber();
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const destinationCustomer = getDestination();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Packing Slip Preview</DialogTitle>
        </DialogHeader>
        
        <PackingSlipPreview
          packingSlipNumber={packingSlipNumber}
          currentDate={currentDate}
          destinationCustomer={destinationCustomer}
          selectedItems={selectedItems}
          totalItems={totalItems}
          totalPackages={totalPackages}
          preparedBy={preparedBy}
          pickedUpBy={pickedUpBy}
        />

        <PackingSlipActions
          packingSlipNumber={packingSlipNumber}
          currentDate={currentDate}
          destinationCustomer={destinationCustomer}
          selectedItems={selectedItems}
          totalItems={totalItems}
          totalPackages={totalPackages}
          preparedBy={preparedBy}
          pickedUpBy={pickedUpBy}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

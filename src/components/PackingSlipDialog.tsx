
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useCustomers } from "@/hooks/useCustomers";
import { PackingSlipPreview } from "./packing-slip/PackingSlipPreview";
import { generatePackingSlipPDF } from "@/utils/packingSlipPdfGenerator";

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

  // Debug logging for staff names
  console.log("PackingSlipDialog staff names:", {
    preparedBy,
    pickedUpBy,
    customer,
    selectedItemsCount: selectedItems.length
  });

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

  const handleDownloadPDF = () => {
    generatePackingSlipPDF({
      packingSlipNumber,
      currentDate,
      destinationCustomer,
      selectedItems,
      totalItems,
      totalPackages,
      preparedBy,
      pickedUpBy,
    });
  };

  const handleCopyDetails = () => {
    const details = `
Packing Slip: ${packingSlipNumber}
Date: ${currentDate}
Destination: ${destinationCustomer ? destinationCustomer.name : "External Customer"}
Items: ${totalItems}
Packages: ${totalPackages}
Prepared by: ${preparedBy}
    `.trim();
    
    navigator.clipboard.writeText(details);
  };

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

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <div className="flex gap-2">
            <Button 
              onClick={handleDownloadPDF}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Download PDF
            </Button>
            <Button 
              variant="outline"
              onClick={handleCopyDetails}
            >
              Copy Details
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

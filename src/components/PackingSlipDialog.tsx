
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useCustomers } from "@/hooks/useCustomers";
import { PackingSlipPreview } from "./packing-slip/PackingSlipPreview";
import { generatePackingSlipPDF } from "@/utils/packingSlipPdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

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

  const handleConfirmAndShip = async () => {
    setIsConfirming(true);
    try {
      // Create the packing slip in the database first
      const batchIds = selectedItems
        .filter(item => item.type === 'batch')
        .map(item => item.id);

      const { data: packingSlip, error: createError } = await supabase
        .from("packing_slips")
        .insert({
          slip_number: packingSlipNumber,
          destination: destinationCustomer ? destinationCustomer.name : "External Customer",
          prepared_by: preparedBy,
          picked_up_by: pickedUpBy,
          batch_ids: batchIds,
          total_items: totalItems,
          total_packages: totalPackages,
          pickup_date: currentDate,
          status: "shipped" as const
        })
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: "Packing Slip Confirmed",
        description: "Packing slip has been created and marked as shipped. It will appear in FAVV reports.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating packing slip:", error);
      toast({
        title: "Error",
        description: "Failed to create packing slip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
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
          <div className="flex gap-2">
            <Button 
              onClick={handleConfirmAndShip}
              disabled={isConfirming}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isConfirming ? "Confirming..." : "Confirm & Ship"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

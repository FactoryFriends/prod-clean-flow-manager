
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
      // Find the most recent packing slip to update its status
      const { data: packingSlips, error: fetchError } = await supabase
        .from("packing_slips")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (packingSlips && packingSlips.length > 0) {
        const { error: updateError } = await supabase
          .from("packing_slips")
          .update({ status: "shipped" })
          .eq("id", packingSlips[0].id);

        if (updateError) throw updateError;

        toast({
          title: "Packing Slip Confirmed",
          description: "Packing slip has been marked as shipped and will appear in FAVV reports",
        });

        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error confirming packing slip:", error);
      toast({
        title: "Error",
        description: "Failed to confirm packing slip. Please try again.",
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

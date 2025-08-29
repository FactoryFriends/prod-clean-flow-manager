
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConfirmDispatch } from "@/hooks/useConfirmDispatch";
import { generatePackingSlipPDF } from "@/utils/pdf/packingSlipPdfGenerator";
import { printPackingSlipA4 } from "@/utils/pdf/packingSlipPrintA4";
import { format } from "date-fns";
import { SelectedItem } from "@/types/dispatch";

interface Customer {
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
}

interface UsePackingSlipActionsProps {
  packingSlipNumber: string;
  currentDate: string;
  destinationCustomer: Customer | null;
  selectedItems: SelectedItem[];
  totalItems: number;
  totalPackages: number;
  preparedBy: string;
  pickedUpBy: string;
  dispatchId?: string;
  packingSlipId?: string;
}

export function usePackingSlipActions({
  packingSlipNumber,
  currentDate,
  destinationCustomer,
  selectedItems,
  totalItems,
  totalPackages,
  preparedBy,
  pickedUpBy,
  dispatchId,
  packingSlipId,
}: UsePackingSlipActionsProps) {
  const { toast } = useToast();
  const confirmDispatch = useConfirmDispatch();

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
    try {
      // First confirm the dispatch to update inventory
      if (dispatchId) {
        await confirmDispatch.mutateAsync(dispatchId);
      }

      // Generate packing slip number and update status to 'shipped'
      if (packingSlipId) {
        const generatedSlipNumber = `PS-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
        
        const { error: updateError } = await supabase
          .from("packing_slips")
          .update({
            slip_number: generatedSlipNumber,
            status: "shipped" as const,
            pickup_date: currentDate,
            item_details: JSON.parse(JSON.stringify(selectedItems))
          })
          .eq("id", packingSlipId);

        if (updateError) throw updateError;
      }

      // Ask user if they want to print the packing slip
      const shouldPrint = window.confirm("Packing slip confirmed successfully! Would you like to print it now?");
      
      if (shouldPrint) {
        printPackingSlipA4({
          packingSlipNumber,
          currentDate,
          destinationCustomer,
          selectedItems,
          totalItems,
          totalPackages,
          preparedBy,
          pickedUpBy,
        });
      }

      toast({
        title: "Packing Slip Confirmed",
        description: `Packing slip has been created and marked as shipped.${shouldPrint ? ' Print dialog opened.' : ''} It will appear in FAVV reports.`,
      });

      return true;
    } catch (error) {
      console.error("Error creating packing slip:", error);
      toast({
        title: "Error",
        description: "Failed to create packing slip. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleDownloadPDF,
    handleCopyDetails,
    handleConfirmAndShip,
  };
}

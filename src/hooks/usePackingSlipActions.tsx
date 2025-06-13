
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generatePackingSlipPDF } from "@/utils/packingSlipPdfGenerator";
import { format } from "date-fns";

interface SelectedItem {
  id: string;
  type: 'batch' | 'external';
  name: string;
  batchNumber?: string;
  selectedQuantity: number;
  productionDate?: string;
}

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
}: UsePackingSlipActionsProps) {
  const { toast } = useToast();

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


import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConfirmDispatch } from "@/hooks/useConfirmDispatch";
import { useDispatchValidation } from "@/hooks/useDispatchValidation";
import { generatePackingSlipPDF } from "@/utils/pdf/packingSlipPdfGenerator";
import { printPackingSlipA4 } from "@/utils/pdf/packingSlipPrintA4";
import { format } from "date-fns";
import { SelectedItem } from "@/types/dispatch";
import { Logger } from "@/utils/logger";

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
  const { validateDispatchForConfirmation } = useDispatchValidation();

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
      Logger.info("Starting confirmation process", {
        component: "usePackingSlipActions",
        data: { dispatchId, packingSlipId, itemCount: selectedItems.length }
      });

      console.log("=== STARTING CONFIRMATION PROCESS ===");
      console.log("Dispatch ID:", dispatchId);
      console.log("Packing Slip ID:", packingSlipId);
      console.log("Selected Items:", selectedItems);

      // Step 0: Validate all required data before starting
      console.log("=== STEP 0: Validating data ===");
      if (!dispatchId || !packingSlipId) {
        throw new Error("Missing required IDs for confirmation");
      }

      const validationResult = await validateDispatchForConfirmation({
        dispatchId,
        packingSlipId,
        selectedItems
      });

      if (!validationResult.isValid) {
        const errorMessage = validationResult.errors.join("; ");
        Logger.error("Validation failed", {
          component: "usePackingSlipActions",
          data: { errors: validationResult.errors }
        });
        throw new Error(`Validation failed: ${errorMessage}`);
      }

      console.log("✅ Validation passed");

      // Step 1: Confirm the dispatch to update inventory
      console.log("=== STEP 1: Confirming dispatch ===");
      try {
        const confirmedDispatch = await confirmDispatch.mutateAsync(dispatchId);
        console.log("✅ Dispatch confirmed successfully:", confirmedDispatch);
        Logger.info("Dispatch confirmed successfully", {
          component: "usePackingSlipActions",
          data: { dispatchId, status: confirmedDispatch.status }
        });
      } catch (dispatchError) {
        console.error("❌ Dispatch confirmation failed:", dispatchError);
        Logger.error("Dispatch confirmation failed", {
          component: "usePackingSlipActions",
          error: dispatchError as Error,
          data: { dispatchId }
        });
        throw new Error(`Failed to confirm dispatch: ${dispatchError instanceof Error ? dispatchError.message : 'Unknown error'}`);
      }

      // Step 2: Generate packing slip number and update status to 'shipped'
      console.log("=== STEP 2: Updating packing slip ===");
      const generatedSlipNumber = `PS-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      console.log("Generated slip number:", generatedSlipNumber);
      
      try {
        // First verify the packing slip exists
        const { data: existingSlip, error: fetchError } = await supabase
          .from("packing_slips")
          .select("*")
          .eq("id", packingSlipId)
          .single();

        if (fetchError) {
          console.error("❌ Failed to fetch packing slip:", fetchError);
          throw new Error(`Failed to fetch packing slip: ${fetchError.message}`);
        }

        console.log("✅ Packing slip found:", existingSlip);

        const { data: updatedSlip, error: updateError } = await supabase
          .from("packing_slips")
          .update({
            slip_number: generatedSlipNumber,
            status: "shipped" as const,
            pickup_date: currentDate,
            item_details: JSON.parse(JSON.stringify(selectedItems))
          })
          .eq("id", packingSlipId)
          .select()
          .single();

        if (updateError) {
          console.error("❌ Failed to update packing slip:", updateError);
          Logger.error("Failed to update packing slip", {
            component: "usePackingSlipActions",
            error: updateError,
            data: { packingSlipId, generatedSlipNumber }
          });
          throw new Error(`Failed to update packing slip: ${updateError.message}`);
        }

        console.log("✅ Packing slip updated successfully:", updatedSlip);
        Logger.info("Packing slip updated successfully", {
          component: "usePackingSlipActions",
          data: { packingSlipId, slipNumber: generatedSlipNumber, status: updatedSlip.status }
        });
      } catch (packingSlipError) {
        console.error("❌ Packing slip update failed:", packingSlipError);
        throw new Error(`Failed to update packing slip: ${packingSlipError instanceof Error ? packingSlipError.message : 'Unknown error'}`);
      }

      // Step 3: Success - Ask user about printing
      console.log("=== STEP 3: Success - offering print option ===");
      const shouldPrint = window.confirm("Packing slip confirmed successfully! Would you like to print it now?");
      
      if (shouldPrint) {
        console.log("User chose to print, opening print dialog");
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
        description: `Packing slip ${generatedSlipNumber} has been created and marked as shipped.${shouldPrint ? ' Print dialog opened.' : ''} It will appear in FAVV reports.`,
      });

      Logger.info("Confirmation process completed successfully", {
        component: "usePackingSlipActions",
        data: { dispatchId, packingSlipId, generatedSlipNumber }
      });

      console.log("=== CONFIRMATION PROCESS COMPLETED SUCCESSFULLY ===");
      return true;
    } catch (error) {
      console.error("=== CONFIRMATION PROCESS FAILED ===");
      console.error("Error details:", error);
      
      Logger.error("Confirmation process failed", {
        component: "usePackingSlipActions",
        error: error as Error,
        data: { dispatchId, packingSlipId }
      });
      
      // Provide more specific error messages
      let errorMessage = "Failed to confirm packing slip. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("Validation failed")) {
          errorMessage = `Data validation failed: ${error.message.replace('Validation failed: ', '')}`;
        } else if (error.message.includes("dispatch")) {
          errorMessage = `Dispatch confirmation failed: ${error.message}`;
        } else if (error.message.includes("packing slip")) {
          errorMessage = `Packing slip update failed: ${error.message}`;
        } else if (error.message.includes("required")) {
          errorMessage = `Missing required data: ${error.message}`;
        } else if (error.message.includes("authentication") || error.message.includes("permission")) {
          errorMessage = `Permission denied: Please ensure you have the necessary permissions to confirm dispatches.`;
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Confirmation Failed", 
        description: errorMessage,
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

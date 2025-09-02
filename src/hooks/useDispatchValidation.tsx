import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/utils/logger";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface DispatchValidationData {
  dispatchId: string;
  packingSlipId: string;
  selectedItems: any[];
}

export function useDispatchValidation() {
  
  const validateDispatchForConfirmation = async ({
    dispatchId,
    packingSlipId,
    selectedItems
  }: DispatchValidationData): Promise<ValidationResult> => {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    Logger.info("Starting dispatch validation", {
      component: "useDispatchValidation",
      data: { dispatchId, packingSlipId, itemCount: selectedItems.length }
    });

    try {
      // 1. Validate required fields
      if (!dispatchId) {
        result.errors.push("Dispatch ID is required");
      }

      if (!packingSlipId) {
        result.errors.push("Packing Slip ID is required");
      }

      if (!selectedItems || selectedItems.length === 0) {
        result.errors.push("No items selected for dispatch");
      }

      // 2. Validate dispatch record exists and has correct status
      if (dispatchId) {
        const { data: dispatchRecord, error: dispatchError } = await supabase
          .from("dispatch_records")
          .select(`
            *,
            dispatch_items (
              id,
              item_type,
              item_name,
              quantity,
              batch_number
            )
          `)
          .eq("id", dispatchId)
          .single();

        if (dispatchError) {
          result.errors.push(`Failed to fetch dispatch record: ${dispatchError.message}`);
        } else if (!dispatchRecord) {
          result.errors.push("Dispatch record not found");
        } else {
          // Check dispatch status
          if (dispatchRecord.status === "confirmed") {
            result.errors.push("Dispatch is already confirmed");
          }

          // Check dispatch has items
          if (!dispatchRecord.dispatch_items || dispatchRecord.dispatch_items.length === 0) {
            result.errors.push("Dispatch has no items to confirm");
          } else {
            // Validate item types are correct
            const invalidItems = dispatchRecord.dispatch_items.filter(item => 
              !['batch', 'external', 'ingredient'].includes(item.item_type)
            );
            
            if (invalidItems.length > 0) {
              result.errors.push(`Invalid item types found: ${invalidItems.map(i => i.item_type).join(', ')}`);
            }
          }
        }
      }

      // 3. Validate packing slip exists and has correct status
      if (packingSlipId) {
        const { data: packingSlip, error: packingSlipError } = await supabase
          .from("packing_slips")
          .select("*")
          .eq("id", packingSlipId)
          .single();

        if (packingSlipError) {
          result.errors.push(`Failed to fetch packing slip: ${packingSlipError.message}`);
        } else if (!packingSlip) {
          result.errors.push("Packing slip not found");
        } else if (packingSlip.status === "shipped") {
          result.errors.push("Packing slip is already shipped");
        }
      }

      // 4. Check inventory levels for batch items
      const batchItems = selectedItems.filter(item => item.type === 'batch');
      for (const item of batchItems) {
        if (item.selectedQuantity > item.availableQuantity) {
          result.errors.push(`Insufficient stock for ${item.name}: requested ${item.selectedQuantity}, available ${item.availableQuantity}`);
        }
      }

      // 5. Check user permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        result.errors.push("User authentication required");
      }

      result.isValid = result.errors.length === 0;

      Logger.info("Dispatch validation completed", {
        component: "useDispatchValidation",
        data: { 
          isValid: result.isValid, 
          errorCount: result.errors.length,
          warningCount: result.warnings.length
        }
      });

      return result;

    } catch (error) {
      Logger.error("Validation failed with exception", {
        component: "useDispatchValidation",
        error: error as Error,
        data: { dispatchId, packingSlipId }
      });
      
      result.isValid = false;
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  };

  return {
    validateDispatchForConfirmation
  };
}
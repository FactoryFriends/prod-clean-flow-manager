
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SelectedItem } from "@/types/dispatch";

interface CreateDispatchData {
  dispatchType: "external" | "internal";
  customer?: string;
  pickerName: string;
  dispatchNotes: string;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
  status?: "draft" | "confirmed";
}

export const useCreateDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dispatchData: CreateDispatchData) => {
      const {
        dispatchType,
        customer,
        pickerName,
        dispatchNotes,
        selectedItems,
        currentLocation,
        status = "draft", // Default to draft status
      } = dispatchData;

      // Calculate totals
      const totalItems = selectedItems.length;
      const totalPackages = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);

      // Create dispatch record
      const { data: dispatchRecord, error: dispatchError } = await supabase
        .from("dispatch_records")
        .insert({
          dispatch_type: dispatchType,
          customer: dispatchType === "external" ? customer : null,
          picker_code: pickerName, // Store picker name in picker_code field for backwards compatibility
          picker_name: pickerName,
          dispatch_notes: dispatchNotes,
          total_items: totalItems,
          total_packages: totalPackages,
          location: currentLocation,
          status: status,
        })
        .select()
        .single();

      if (dispatchError) throw dispatchError;

      // Create dispatch items
      const dispatchItems = selectedItems.map(item => ({
        dispatch_id: dispatchRecord.id,
        item_id: item.id,
        item_type: item.type,
        item_name: item.name,
        batch_number: item.batchNumber || null,
        quantity: item.selectedQuantity,
        production_date: item.productionDate || null,
        expiry_date: item.expiryDate || null,
      }));

      const { error: itemsError } = await supabase
        .from("dispatch_items")
        .insert(dispatchItems);

      if (itemsError) {
        // Handle authentication errors gracefully
        if (itemsError.code === 'PGRST116' || itemsError.message?.includes('permission')) {
          throw new Error("You don't have permission to create dispatch items. Please sign in.");
        }
        throw itemsError;
      }

      return dispatchRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-records"] });
      
      // Only invalidate production batches if dispatch is confirmed, not for drafts
      if (data.status === "confirmed") {
        queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      }
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StockAdjustmentData {
  batchId: string;
  newRemainingStock: number;
  reason: string;
  adjustedBy: string;
}

export const useStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, newRemainingStock, reason, adjustedBy }: StockAdjustmentData) => {
      // First get current batch data to calculate adjustment
      const { data: batch, error: batchError } = await supabase
        .from("production_batches")
        .select("packages_produced, manual_stock_adjustment")
        .eq("id", batchId)
        .single();

      if (batchError) throw batchError;

      // Get only DRAFT dispatch quantities (confirmed ones are already subtracted
      // from packages_produced by the DB trigger update_inventory_on_dispatch_confirmation).
      // Using all dispatch items here would double-count confirmed dispatches.
      const { data: dispatchItems, error: dispatchError } = await supabase
        .from("dispatch_items")
        .select(`
          quantity,
          dispatch_records!inner(status)
        `)
        .eq("item_id", batchId)
        .eq("item_type", "batch")
        .eq("dispatch_records.status", "draft");

      if (dispatchError) throw dispatchError;

      const draftReserved = dispatchItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const currentAdjustment = batch.manual_stock_adjustment || 0;

      // packages_produced is already reduced by confirmed dispatches (DB trigger).
      // Formula: stock_in_ui = packages_produced + adjustment - draftReserved
      // → adjustment = newRemainingStock - packages_produced + draftReserved
      const newAdjustment = newRemainingStock - batch.packages_produced + draftReserved;
      const currentDisplayedStock = Math.max(
        0,
        batch.packages_produced + currentAdjustment - draftReserved
      );

      const { data, error } = await supabase
        .from("production_batches")
        .update({
          manual_stock_adjustment: newAdjustment,
          adjusted_by: adjustedBy,
          adjustment_reason: reason,
          adjustment_timestamp: new Date().toISOString(),
        })
        .eq("id", batchId)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await supabase.from("audit_logs").insert({
        action_type: "stock_adjustment",
        action_description: `Stock adjusted from ${batch.packages_produced + currentAdjustment - totalDispatched} to ${newRemainingStock}`,
        reference_type: "production_batch",
        reference_id: batchId,
        staff_name: adjustedBy,
        metadata: {
          old_remaining_stock: batch.packages_produced + currentAdjustment - totalDispatched,
          new_remaining_stock: newRemainingStock,
          adjustment_reason: reason,
          old_adjustment: currentAdjustment,
          new_adjustment: newAdjustment,
        },
        favv_relevant: true,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["batches-in-stock"] });
      toast.success("Stock quantity updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update stock: ${error.message}`);
    },
  });
};
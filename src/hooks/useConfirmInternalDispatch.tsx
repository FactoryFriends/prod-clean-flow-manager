import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "./queryKeys";

export function useConfirmInternalDispatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ dispatchId, confirmedBy }: { dispatchId: string; confirmedBy: string }) => {
      // First, get the dispatch and its items to validate stock
      const { data: dispatch, error: dispatchError } = await supabase
        .from("dispatch_records")
        .select(`
          *,
          dispatch_items (*)
        `)
        .eq("id", dispatchId)
        .eq("status", "draft")
        .single();

      if (dispatchError || !dispatch) {
        throw new Error("Dispatch not found or already confirmed");
      }

      // Group items by batch to get total requested quantity per batch
      const batchQuantities = new Map<string, number>();
      dispatch.dispatch_items.forEach(item => {
        if (item.item_type === 'batch') {
          const currentQty = batchQuantities.get(item.item_id) || 0;
          batchQuantities.set(item.item_id, currentQty + item.quantity);
        }
      });

      // Check stock availability for each batch, excluding current dispatch
      const stockIssues: string[] = [];
      
      for (const [batchId, requestedQuantity] of batchQuantities.entries()) {
        // Use the new function that excludes the current dispatch from stock calculations
        const { data: freeStock, error: stockError } = await supabase
          .rpc('get_batch_free_stock_excluding_dispatch', { 
            batch_id_param: batchId, 
            exclude_dispatch_id_param: dispatchId 
          });

        if (stockError) {
          console.error("Error checking stock for batch:", batchId, stockError);
          continue;
        }

        const availableStock = freeStock || 0;
        const batchItem = dispatch.dispatch_items.find(item => item.item_id === batchId);
        
        if (availableStock < requestedQuantity) {
          stockIssues.push(`${batchItem?.item_name || batchId}: Available ${availableStock}, Requested ${requestedQuantity}`);
        }
      }

      if (stockIssues.length > 0) {
        throw new Error(`Insufficient stock:\n${stockIssues.join('\n')}`);
      }

      // If stock validation passes, confirm the dispatch
      const { data, error } = await supabase
        .from("dispatch_records")
        .update({ 
          status: "confirmed",
          updated_at: new Date().toISOString()
        })
        .eq("id", dispatchId)
        .eq("status", "draft")
        .select()
        .single();

      if (error) {
        console.error("Error confirming internal dispatch:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Dispatch not found or already confirmed");
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch.internal() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch.records() });
      queryClient.invalidateQueries({ queryKey: queryKeys.production.batches() });
      // Also invalidate batch stock queries to refresh availability
      queryClient.invalidateQueries({ queryKey: ['batches-in-stock'] });
      
      toast({
        title: "Internal Pick Confirmed",
        description: "Items have been confirmed as picked up and inventory has been updated.",
      });
    },
    onError: (error: any) => {
      console.error("Error confirming internal dispatch:", error);
      
      let errorMessage = "Failed to confirm internal pick. Please try again.";
      
      if (error.message?.includes("Insufficient stock")) {
        errorMessage = error.message;
      } else if (error.message?.includes("not found")) {
        errorMessage = "This dispatch was not found or has already been confirmed.";
      }
      
      toast({
        title: "Cannot Confirm Pick",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
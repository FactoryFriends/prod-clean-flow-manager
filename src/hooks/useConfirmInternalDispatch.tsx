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

      // Check stock availability for each batch item
      const stockIssues: string[] = [];
      
      for (const item of dispatch.dispatch_items) {
        if (item.item_type === 'batch') {
          // Use the existing function to get remaining stock
          const { data: stockData, error: stockError } = await supabase
            .rpc('get_batch_remaining_stock', { batch_id_param: item.item_id });

          if (stockError) {
            console.error("Error checking stock for batch:", item.item_id, stockError);
            continue;
          }

          const availableStock = stockData || 0;
          
          if (availableStock < item.quantity) {
            stockIssues.push(`${item.item_name}: Available ${availableStock}, Requested ${item.quantity}`);
          }
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
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch.records() });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      
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
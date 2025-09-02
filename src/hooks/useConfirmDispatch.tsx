import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/utils/logger";

export const useConfirmDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dispatchId: string) => {
      Logger.info("Starting dispatch confirmation", { 
        component: "useConfirmDispatch", 
        data: { dispatchId }
      });

      // Validate dispatchId
      if (!dispatchId) {
        throw new Error("Dispatch ID is required for confirmation");
      }

      // First, verify the dispatch exists and get its current data
      const { data: existingDispatch, error: fetchError } = await supabase
        .from("dispatch_records")
        .select(`
          *,
          dispatch_items (*)
        `)
        .eq("id", dispatchId)
        .single();

      if (fetchError) {
        Logger.error("Failed to fetch dispatch record", { 
          component: "useConfirmDispatch", 
          error: fetchError,
          data: { dispatchId }
        });
        throw new Error(`Failed to fetch dispatch record: ${fetchError.message}`);
      }

      if (!existingDispatch) {
        throw new Error("Dispatch record not found");
      }

      Logger.info("Dispatch record found", { 
        component: "useConfirmDispatch", 
        data: { dispatch: existingDispatch }
      });

      // Check if dispatch has items
      if (!existingDispatch.dispatch_items || existingDispatch.dispatch_items.length === 0) {
        throw new Error("Cannot confirm dispatch: no items found in dispatch record");
      }

      // Update dispatch status to confirmed
      const { data, error } = await supabase
        .from("dispatch_records")
        .update({ 
          status: "confirmed",
          updated_at: new Date().toISOString()
        })
        .eq("id", dispatchId)
        .select()
        .single();

      if (error) {
        Logger.error("Failed to update dispatch status", { 
          component: "useConfirmDispatch", 
          error,
          data: { dispatchId }
        });
        throw new Error(`Failed to confirm dispatch: ${error.message}`);
      }

      Logger.info("Dispatch confirmation successful", { 
        component: "useConfirmDispatch", 
        data: { confirmedDispatch: data }
      });

      return data;
    },
    onSuccess: (data) => {
      Logger.info("Dispatch confirmation completed, invalidating queries", { 
        component: "useConfirmDispatch", 
        data: { dispatchId: data.id }
      });
      queryClient.invalidateQueries({ queryKey: ["dispatch-records"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["packing-slips"] });
    },
    onError: (error) => {
      Logger.error("Dispatch confirmation failed", { 
        component: "useConfirmDispatch", 
        error 
      });
    }
  });
};
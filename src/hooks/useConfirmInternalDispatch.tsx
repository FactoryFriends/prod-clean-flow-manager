import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "./queryKeys";

export function useConfirmInternalDispatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ dispatchId, confirmedBy }: { dispatchId: string; confirmedBy: string }) => {
      const { data, error } = await supabase
        .from("dispatch_records")
        .update({ 
          status: "confirmed",
          updated_at: new Date().toISOString()
        })
        .eq("id", dispatchId)
        .eq("status", "draft") // Only confirm if still in draft
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
      toast({
        title: "Error",
        description: "Failed to confirm internal pick. Please try again.",
        variant: "destructive",
      });
    },
  });
}
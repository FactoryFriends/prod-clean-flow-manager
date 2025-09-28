import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryKeys } from "./queryKeys";

interface CancelInternalDispatchParams {
  dispatchId: string;
}

export function useCancelInternalDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dispatchId }: CancelInternalDispatchParams) => {
      const { data, error } = await supabase
        .from("dispatch_records")
        .update({ status: "cancelled" })
        .eq("id", dispatchId)
        .eq("dispatch_type", "internal")
        .select()
        .single();

      if (error) {
        console.error("Error cancelling internal dispatch:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch.internal() });
      queryClient.invalidateQueries({ queryKey: queryKeys.production.batches() });
      queryClient.invalidateQueries({ queryKey: ["batches-in-stock"] });
      
      toast.success("Internal pick cancelled successfully");
    },
    onError: (error) => {
      console.error("Error cancelling internal dispatch:", error);
      toast.error("Failed to cancel internal pick");
    },
  });
}
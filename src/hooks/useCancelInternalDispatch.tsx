import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CancelInternalDispatchParams {
  dispatchId: string;
  location: string;
}

export function useCancelInternalDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dispatchId, location }: CancelInternalDispatchParams) => {
      console.debug("[useCancelInternalDispatch] Starting cancellation (direct update)", { dispatchId, location });

      const { data, error } = await supabase
        .from('dispatch_records')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', dispatchId)
        .eq('dispatch_type', 'internal')
        .eq('status', 'draft')
        .select('id');

      if (error) {
        console.error("[useCancelInternalDispatch] Update error", { error });
        throw error;
      }

      const updatedId = Array.isArray(data) && data.length > 0 ? (data as any)[0]?.id : null;
      if (!updatedId) {
        console.debug("[useCancelInternalDispatch] No rows updated - dispatch not found or already handled", { dispatchId });
        throw new Error("This pick was not found or is already handled.");
      }

      console.debug("[useCancelInternalDispatch] Successfully cancelled dispatch", { dispatchId, updatedId });
      return { id: updatedId } as any;
    },
    onMutate: async ({ dispatchId, location }) => {
      console.debug("[useCancelInternalDispatch] onMutate - no optimistic cache edits", { dispatchId, location });
      return { dispatchId, location };
    },
    onError: (error, _variables, context) => {
      // Rollback optimistic updates on error
      const prev = (context as any)?.previous as [unknown, any][] | undefined;
      if (prev) {
        prev.forEach(([key, data]) => {
          queryClient.setQueryData(key as any, data);
        });
      }
      console.error("Error cancelling internal dispatch:", error);
      const message = (error as any)?.message || "Failed to cancel internal pick";
      toast.error(message);
    },
    onSuccess: (_data, variables) => {
      console.debug("[useCancelInternalDispatch] onSuccess", { dispatchId: variables.dispatchId, location: variables.location });
      toast.success("Internal pick cancelled successfully");
    },
    onSettled: async (_data, _error, variables) => {
      const { dispatchId, location } = variables;
      console.debug("[useCancelInternalDispatch] onSettled - invalidate and refetch", { dispatchId, location });

      // Invalidate and refetch the exact internal dispatch list for the location
      await queryClient.invalidateQueries({ queryKey: ["internal-dispatch-records", location] });
      await queryClient.refetchQueries({ queryKey: ["internal-dispatch-records", location], type: 'active' });

      // Also invalidate general dispatch records for the location (if used elsewhere)
      await queryClient.invalidateQueries({ queryKey: ["dispatch", "records", location] });

      console.debug("[useCancelInternalDispatch] onSettled completed");
    },
  });
}

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
      console.debug("[useCancelInternalDispatch] Starting cancellation", { dispatchId, location });

      // Try RPC first
      try {
        const { data, error } = await supabase.rpc('cancel_internal_dispatch', { p_id: dispatchId });
        console.debug("[useCancelInternalDispatch] RPC response", { data, error, dispatchId });
        if (!error) {
          const cancelledId = Array.isArray(data) && data.length > 0 ? (data as any)[0]?.cancelled_id : null;
          if (cancelledId) {
            console.debug("[useCancelInternalDispatch] Cancelled via RPC", { dispatchId, cancelledId });
            return { id: cancelledId } as any;
          }
          console.debug("[useCancelInternalDispatch] RPC returned no rows; will fallback", { dispatchId });
        } else {
          console.warn("[useCancelInternalDispatch] RPC error; will fallback to direct update", { error });
        }
      } catch (rpcErr) {
        console.warn("[useCancelInternalDispatch] RPC threw; will fallback", { rpcErr });
      }

      // Fallback: direct update on dispatch_records
      const { data: updData, error: updError } = await supabase
        .from('dispatch_records')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', dispatchId)
        .eq('dispatch_type', 'internal')
        .eq('status', 'draft')
        .select('id');

      if (updError) {
        console.error("[useCancelInternalDispatch] Fallback update error", { updError });
        throw updError;
      }

      const updatedId = Array.isArray(updData) && updData.length > 0 ? (updData as any)[0]?.id : null;
      if (!updatedId) {
        throw new Error("This pick was not found or is already handled.");
      }
      console.debug("[useCancelInternalDispatch] Cancelled via fallback update", { dispatchId, updatedId });
      return { id: updatedId } as any;
    },
    onMutate: async ({ dispatchId, location }) => {
      console.debug("[useCancelInternalDispatch] onMutate - pausing queries (no optimistic remove)", { dispatchId, location });

      // Cancel any outgoing refetches for internal dispatch lists
      await queryClient.cancelQueries({ queryKey: ["internal-dispatch-records"] });

      // Snapshot current lists so we can rollback if needed
      const previous = queryClient.getQueriesData<any>({ queryKey: ["internal-dispatch-records"] });

      return { previous, dispatchId, location };
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
    onSuccess: (data, variables, context) => {
      console.debug("[useCancelInternalDispatch] onSuccess", { dispatchId: variables.dispatchId, location: variables.location });
      
      // Ensure the specific location query is updated
      const locationKey = ["internal-dispatch-records", variables.location];
      const currentData = queryClient.getQueryData<any[]>(locationKey);
      if (currentData) {
        const filteredData = currentData.filter((rec: any) => rec?.id !== variables.dispatchId);
        queryClient.setQueryData(locationKey, filteredData);
        console.debug("[useCancelInternalDispatch] Updated location-specific cache", { locationKey, remainingCount: filteredData.length });
      }
      
      toast.success("Internal pick cancelled successfully");
    },
    onSettled: async (_data, _error, variables) => {
      const { dispatchId, location } = variables;
      console.debug("[useCancelInternalDispatch] onSettled - starting invalidation and refetch", { dispatchId, location });
      
      // Invalidate broad set of related queries
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && (
          q.queryKey[0] === 'internal-dispatch-records' ||
          q.queryKey[0] === 'dispatch' ||
          (q.queryKey[0] === 'production' && q.queryKey[1] === 'batches') ||
          q.queryKey[0] === 'batches-in-stock'
        )
      });
      
      // Force refetch the specific location query to update counters
      await queryClient.refetchQueries({
        queryKey: ["internal-dispatch-records", location],
        type: 'active'
      });
      
      // Also refetch all internal dispatch queries
      await queryClient.refetchQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'internal-dispatch-records',
        type: 'active'
      });
      
      console.debug("[useCancelInternalDispatch] onSettled completed");
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryKeys } from "./queryKeys";

interface CancelInternalDispatchParams {
  dispatchId: string;
  location: string;
}

export function useCancelInternalDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dispatchId, location }: CancelInternalDispatchParams) => {
      console.log("[useCancelInternalDispatch] Starting cancellation via RPC", { dispatchId, location });

      const { data, error } = await supabase
        .rpc('cancel_internal_dispatch', { p_id: dispatchId });

      if (error) {
        console.error("[useCancelInternalDispatch] RPC error", { error });
        // Map constraint errors to friendly messages
        if (error.code === '23514') {
          throw new Error("This action isn't allowed for the current status.");
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("This pick was not found, is not internal, or is not in draft anymore.");
      }

      console.log("[useCancelInternalDispatch] Cancelled successfully", { id: data[0].cancelled_id });
      return { id: data[0].cancelled_id };
    },
    onMutate: async ({ dispatchId, location }) => {
      console.log("[useCancelInternalDispatch] onMutate", { dispatchId, location });
      toast.info("Cancelling pick…");
      return { dispatchId, location };
    },
    onError: (error) => {
      console.error("Error cancelling internal dispatch:", error);
      const message = (error as any)?.message || "Failed to cancel internal pick";
      toast.error(message);
    },
    onSuccess: (_data, variables) => {
      console.log("[useCancelInternalDispatch] onSuccess", { dispatchId: variables.dispatchId, location: variables.location });
      // Optimistically remove the cancelled record from cache for snappier UX
      queryClient.setQueryData(queryKeys.dispatch.internal(variables.location), (old: any[] | undefined) => {
        if (!old) return old;
        return old.filter((d: any) => d.id !== variables.dispatchId);
      });
      toast.success("Internal pick cancelled successfully");
    },
    onSettled: async (_data, _error, variables) => {
      const { location } = variables;
      console.log("[useCancelInternalDispatch] onSettled - invalidate", { location });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.dispatch.internal(location) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dispatch.records(location) }),
        queryClient.refetchQueries({ queryKey: queryKeys.dispatch.internal(location), type: 'active' }),
      ]);
      console.log("[useCancelInternalDispatch] onSettled completed");
    },
  });
}

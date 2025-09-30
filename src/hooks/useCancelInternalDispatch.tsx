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
      console.log("[useCancelInternalDispatch] Starting cancellation (direct)", { dispatchId, location });

      const { data, error } = await supabase
        .from('dispatch_records')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', dispatchId)
        .eq('dispatch_type', 'internal')
        .eq('status', 'draft')
        .select('id, status')
        .maybeSingle();

      if (error) {
        console.error("[useCancelInternalDispatch] Update error", { error });
        throw error;
      }

      if (!data) {
        // Fetch existing row to provide a clearer error
        const { data: existing, error: fetchErr } = await supabase
          .from('dispatch_records')
          .select('id, status, dispatch_type')
          .eq('id', dispatchId)
          .maybeSingle();

        if (fetchErr) {
          console.warn("[useCancelInternalDispatch] Fallback fetch error", { fetchErr });
          throw new Error("Could not cancel: dispatch not found or insufficient permissions.");
        }

        if (!existing) {
          throw new Error("This pick was not found.");
        }
        if (existing.dispatch_type !== 'internal') {
          throw new Error("Not an internal pick.");
        }
        if (existing.status !== 'draft') {
          throw new Error(`This pick is already ${existing.status}.`);
        }
        throw new Error("No changes applied.");
      }

      console.log("[useCancelInternalDispatch] Cancelled", { id: data.id });
      return { id: data.id } as any;
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

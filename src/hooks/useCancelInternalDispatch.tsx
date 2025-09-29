import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CancelInternalDispatchParams {
  dispatchId: string;
}

export function useCancelInternalDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dispatchId }: CancelInternalDispatchParams) => {
      const { data, error } = await supabase
        .from("dispatch_records")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", dispatchId)
        .eq("dispatch_type", "internal")
        .eq("status", "draft")
        .select()
        .maybeSingle();

      if (error) {
        console.error("Error cancelling internal dispatch:", error);
        throw error;
      }

      if (!data) {
        // No matching draft dispatch (likely already confirmed/cancelled)
        throw new Error("This pick was not found or is already handled.");
      }

      return data;
    },
    onMutate: async ({ dispatchId }) => {
      // Cancel any outgoing refetches for internal dispatch lists
      await queryClient.cancelQueries({ queryKey: ["internal-dispatch-records"] });

      // Snapshot current lists so we can rollback on error
      const previous = queryClient.getQueriesData<any>({ queryKey: ["internal-dispatch-records"] });

      // Optimistically remove the cancelled dispatch from all cached lists
      previous.forEach(([key, old]) => {
        if (Array.isArray(old)) {
          const next = old.filter((rec: any) => rec?.id !== dispatchId);
          queryClient.setQueryData(key, next);
        }
      });

      console.debug("[useCancelInternalDispatch] Optimistic remove", { dispatchId, affectedCaches: previous.map(([k]) => k) });

      return { previous };
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
    onSuccess: () => {
      toast.success("Internal pick cancelled successfully");
    },
    onSettled: async (_data, _error, variables) => {
      // Invalidate and immediately refetch active internal dispatch queries
      console.debug("[useCancelInternalDispatch] onSettled", { dispatchId: (variables as any)?.dispatchId });
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && (
          q.queryKey[0] === 'internal-dispatch-records' ||
          q.queryKey[0] === 'dispatch' ||
          (q.queryKey[0] === 'production' && q.queryKey[1] === 'batches') ||
          q.queryKey[0] === 'batches-in-stock'
        )
      });
      await queryClient.refetchQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'internal-dispatch-records',
        type: 'active'
      });
    },
  });
}

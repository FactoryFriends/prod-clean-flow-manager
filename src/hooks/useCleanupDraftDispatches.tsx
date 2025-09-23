import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "./queryKeys";

export function useCleanupDraftDispatches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hoursOld = 24 }: { hoursOld?: number } = {}) => {
      // Calculate cutoff time
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursOld);

      // Find and cancel old draft dispatches
      const { data: oldDrafts, error: findError } = await supabase
        .from("dispatch_records")
        .select("id, created_at, location, picker_name")
        .eq("dispatch_type", "internal")
        .eq("status", "draft")
        .lt("created_at", cutoffTime.toISOString());

      if (findError) {
        throw new Error(`Failed to find old drafts: ${findError.message}`);
      }

      if (!oldDrafts || oldDrafts.length === 0) {
        return { cleaned: 0, message: "No old draft dispatches found" };
      }

      // Cancel the old drafts
      const { error: cancelError } = await supabase
        .from("dispatch_records")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .in("id", oldDrafts.map(d => d.id));

      if (cancelError) {
        throw new Error(`Failed to cancel old drafts: ${cancelError.message}`);
      }

      return {
        cleaned: oldDrafts.length,
        message: `Cleaned up ${oldDrafts.length} old draft dispatch(es)`,
        cleanedDrafts: oldDrafts
      };
    },
    onSuccess: (result) => {
      if (result.cleaned > 0) {
        toast({
          title: "Cleanup Complete",
          description: result.message,
        });
      }
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: queryKeys.dispatch.internal() });
      queryClient.invalidateQueries({ queryKey: queryKeys.production.batches() });
    },
    onError: (error: any) => {
      console.error("Error cleaning up draft dispatches:", error);
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to clean up old draft dispatches",
        variant: "destructive",
      });
    },
  });
}
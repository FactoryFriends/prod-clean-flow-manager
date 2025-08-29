import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useConfirmDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dispatchId: string) => {
      const { data, error } = await supabase
        .from("dispatch_records")
        .update({ status: "confirmed" })
        .eq("id", dispatchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-records"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["packing-slips"] });
    },
  });
};
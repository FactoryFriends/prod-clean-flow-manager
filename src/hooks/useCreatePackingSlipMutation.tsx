
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCreatePackingSlip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dispatchId,
      slipNumber,
      destination,
      preparedBy,
      pickedUpBy,
      batchIds,
      totalItems,
      totalPackages,
    }: {
      dispatchId: string;
      slipNumber: string;
      destination: string;
      preparedBy: string;
      pickedUpBy: string;
      batchIds: string[];
      totalItems: number;
      totalPackages: number;
    }) => {
      const { data, error } = await supabase
        .from("packing_slips")
        .insert({
          dispatch_id: dispatchId,
          slip_number: slipNumber,
          destination,
          prepared_by: preparedBy,
          picked_up_by: pickedUpBy,
          batch_ids: batchIds,
          total_items: totalItems,
          total_packages: totalPackages,
          pickup_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packing-slips"] });
    },
  });
};

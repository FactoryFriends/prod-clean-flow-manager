
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Movement {
  id: string;
  dispatch_type: string;
  dispatch_date: string;
  destination?: string | null;
  customer?: string | null;
  picker_name: string;
  quantity: number;
  dispatch_notes?: string;
  created_at: string;
}

export const useBatchMovements = (batchId: string) => {
  return useQuery({
    queryKey: ["batch-movements", batchId],
    queryFn: async () => {
      // Get all dispatch_items joined to dispatch_records for this batch
      const { data, error } = await supabase
        .from("dispatch_items")
        .select(
          `
            *,
            dispatch_records:dispatch_id (
              id,
              dispatch_type,
              created_at,
              picker_name,
              customer,
              dispatch_notes,
              location
            )
          `
        )
        .eq("item_id", batchId)
        .eq("item_type", "batch")
        .order("created_at", { ascending: false });

      if (error) {
        // Handle authentication errors gracefully
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          toast.error("Please sign in to view batch movements");
          return [];
        }
        throw error;
      }
      if (!data) return [];
      return data.map((item: any) => ({
        id: item.id,
        dispatch_type: item.dispatch_records?.dispatch_type,
        dispatch_date: item.dispatch_records?.created_at,
        destination: item.dispatch_records?.location,
        customer: item.dispatch_records?.customer,
        picker_name: item.dispatch_records?.picker_name,
        quantity: item.quantity,
        dispatch_notes: item.dispatch_records?.dispatch_notes,
        created_at: item.created_at,
      }));
    },
    enabled: !!batchId,
  });
};

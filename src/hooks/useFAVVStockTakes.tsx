
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseFAVVStockTakesProps {
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

export function useFAVVStockTakes({ startDate, endDate, enabled = true }: UseFAVVStockTakesProps) {
  return useQuery({
    queryKey: ["favv-stock-takes", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("production_batches")
        .select(`
          *,
          products (name, unit_type),
          chefs (name)
        `)
        .eq("location", "tothai")
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: enabled,
  });
}

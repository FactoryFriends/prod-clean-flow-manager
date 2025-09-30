import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./queryKeys";

export function useInternalDispatchRecords(location?: string) {
  return useQuery({
    queryKey: queryKeys.dispatch.internal(location),
    queryFn: async () => {
      let query = supabase
        .from("dispatch_records")
        .select(`
          *,
          dispatch_items (*)
        `)
        .eq("dispatch_type", "internal")
        .eq("status", "draft") // Only get draft internal dispatches, not cancelled ones
        .order("created_at", { ascending: false });

      if (location) {
        query = query.eq("location", location);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching internal dispatch records:", error);
        throw error;
      }
      
      return data || [];
    },
    placeholderData: keepPreviousData,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });
}
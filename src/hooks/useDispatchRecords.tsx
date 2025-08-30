
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logger } from "@/utils/logger";
import { queryKeys } from "./queryKeys";

export const useDispatchRecords = (location?: string) => {
  return useQuery({
    queryKey: queryKeys.dispatch.records(location),
    queryFn: async () => {
      let query = supabase
        .from("dispatch_records")
        .select(`
          *,
          dispatch_items (*)
        `)
        .order("created_at", { ascending: false });

      if (location) {
        query = query.eq("location", location);
      }

      const { data, error } = await query;
      if (error) {
        // Handle authentication errors gracefully
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          Logger.warn("Authentication required for dispatch records", { component: "useDispatchRecords" });
          toast.error("Please sign in to view dispatch records");
          return [];
        }
        Logger.error("Error fetching dispatch records", { error, data: { location }, component: "useDispatchRecords" });
        throw error;
      }
      return data;
    },
  });
};

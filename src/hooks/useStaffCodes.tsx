
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStaffCodes = () => {
  return useQuery({
    queryKey: ["staff-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_codes")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) {
        // Handle permission denied errors gracefully
        if (error.code === 'PGRST116' || error.message.includes('permission')) {
          toast.error("You don't have permission to view staff information. Admin access required.");
          return [];
        }
        throw error;
      }
      return data;
    },
  });
};


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStaffCodes = () => {
  return useQuery({
    queryKey: ["staff-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_codes")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};


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
        console.warn("Staff codes access limited:", error.message);
        return [];
      }
      return data;
    },
    retry: false, // Don't retry on permission errors
  });
};

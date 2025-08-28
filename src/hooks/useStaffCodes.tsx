
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
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching staff codes:", error);
        toast.error("Failed to load staff codes");
        throw error;
      }
      
      console.log("Staff codes loaded:", data);
      return data || [];
    },
  });
};

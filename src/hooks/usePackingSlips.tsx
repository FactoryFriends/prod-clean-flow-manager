
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PackingSlip {
  id: string;
  slip_number: string;
  destination: string;
  batch_ids: string[];
  prepared_by?: string;
  picked_up_by?: string;
  pickup_date?: string;
  created_at: string;
  total_items: number;
  total_packages: number;
}

export const usePackingSlips = (location?: "tothai" | "khin") => {
  return useQuery({
    queryKey: ["packing-slips", location],
    queryFn: async () => {
      let query = supabase
        .from("packing_slips")
        .select("*");
      
      const { data, error } = await query
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PackingSlip[];
    },
  });
};

export const useCreatePackingSlip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slipData: {
      slip_number: string;
      destination: string;
      batch_ids: string[];
      prepared_by?: string;
      picked_up_by?: string;
      pickup_date?: string;
      total_items: number;
      total_packages: number;
    }) => {
      const { data, error } = await supabase
        .from("packing_slips")
        .insert(slipData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packing-slips"] });
      toast.success("Packing slip created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create packing slip: " + error.message);
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UnitOption = {
  id: string;
  name: string;
  unit_type: 'purchase' | 'inner';
  active: boolean;
  created_at: string;
  updated_at: string;
};

// Fetch all unit options
export function useUnitOptionsQuery() {
  return useQuery({
    queryKey: ["unit-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_options")
        .select("*")
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      return data as UnitOption[];
    },
  });
}

// Get purchase units only
export function usePurchaseUnits() {
  const { data: unitOptions = [] } = useUnitOptionsQuery();
  return unitOptions.filter(unit => unit.unit_type === 'purchase').map(unit => unit.name);
}

// Get inner units only
export function useInnerUnits() {
  const { data: unitOptions = [] } = useUnitOptionsQuery();
  return unitOptions.filter(unit => unit.unit_type === 'inner').map(unit => unit.name);
}

// Create new unit option
export function useCreateUnitOption() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, unit_type }: { name: string; unit_type: 'purchase' | 'inner' }) => {
      const { data, error } = await supabase
        .from("unit_options")
        .insert({ name: name.trim().toUpperCase(), unit_type })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-options"] });
      toast.success("Unit option added successfully");
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error("This unit already exists");
      } else {
        toast.error("Failed to add unit option");
      }
    },
  });
}

// Delete unit option
export function useDeleteUnitOption() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("unit_options")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-options"] });
      toast.success("Unit option removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove unit option");
    },
  });
}

// Update unit option
export function useUpdateUnitOption() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UnitOption> }) => {
      const { data, error } = await supabase
        .from("unit_options")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-options"] });
      toast.success("Unit option updated successfully");
    },
    onError: () => {
      toast.error("Failed to update unit option");
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StaffCodeInsert {
  code: string;
  name: string;
  role?: string;
  location?: "tothai" | "khin" | "both";
  active?: boolean;
}

export interface StaffCodeUpdate extends Partial<StaffCodeInsert> {
  code: string; // code is the primary key
}

export const useCreateStaffCode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: StaffCodeInsert) => {
      const { error } = await supabase
        .from("staff_codes")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-codes"] });
      toast({
        title: "Success",
        description: "Staff code created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff code",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStaffCode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ code, ...data }: StaffCodeUpdate) => {
      const { error } = await supabase
        .from("staff_codes")
        .update(data)
        .eq("code", code);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-codes"] });
      toast({
        title: "Success",
        description: "Staff code updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff code",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteStaffCode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (code: string) => {
      const { error } = await supabase
        .from("staff_codes")
        .delete()
        .eq("code", code);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-codes"] });
      toast({
        title: "Success",
        description: "Staff code deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff code",
        variant: "destructive",
      });
    },
  });
};

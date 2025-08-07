import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChefData {
  name: string;
  location: "tothai" | "khin";
  active: boolean;
}

interface UpdateChefData extends ChefData {
  id: string;
}

export function useCreateChef() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChefData) => {
      const { data: chef, error } = await supabase
        .from("chefs")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return chef;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefs"] });
      toast({
        title: "Success",
        description: "Chef created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating chef:", error);
      toast({
        title: "Error",
        description: "Failed to create chef",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateChef() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateChefData) => {
      const { id, ...updateData } = data;
      const { data: chef, error } = await supabase
        .from("chefs")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return chef;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefs"] });
      toast({
        title: "Success",
        description: "Chef updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating chef:", error);
      toast({
        title: "Error",
        description: "Failed to update chef",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteChef() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chefs")
        .update({ active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefs"] });
      toast({
        title: "Success",
        description: "Chef deactivated successfully",
      });
    },
    onError: (error) => {
      console.error("Error deactivating chef:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate chef",
        variant: "destructive",
      });
    },
  });
}
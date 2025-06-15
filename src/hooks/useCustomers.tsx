import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Customer {
  id: string;
  name: string;
  customer_type: "restaurant" | "external";
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  delivery_instructions?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  name: string;
  customer_type: "restaurant" | "external";
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  delivery_instructions?: string;
  active?: boolean;
}

export const useCustomers = (activeOnly: boolean = false) => {
  return useQuery({
    queryKey: ["customers", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*")
        .order("name");

      if (activeOnly) {
        query = query.eq("active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Customer[];
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      const { error } = await supabase
        .from("customers")
        .insert(data);

      if (error) throw error;
    },
    onMutate: async (_newCustomer) => {
      await queryClient.cancelQueries({ queryKey: ["customers"] });
      const previous = queryClient.getQueryData(["customers"]);
      // Optimistic add (fake id)
      const fakeId = "optimistic-" + Date.now();
      const optimistic = { ..._newCustomer, id: fakeId, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      if (previous) queryClient.setQueryData(["customers"], (old: any) => [...old, optimistic]);
      return { previous };
    },
    onError: (err, variables, ctx: any) => {
      if (ctx?.previous) queryClient.setQueryData(["customers"], ctx.previous);
      toast({
        title: "Error",
        description: err.message || "Failed to create customer",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onSuccess: () => {
      toast({
        title: "Customer Created",
        description: "Customer has been created successfully",
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCustomerData> }) => {
      const { error } = await supabase
        .from("customers")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["customers"] });
      const previous = queryClient.getQueryData(["customers"]);
      queryClient.setQueryData(["customers"], (old: any) =>
        old ? old.map((c: any) => c.id === payload.id ? { ...c, ...payload.data } : c) : []
      );
      return { previous };
    },
    onError: (err, variables, ctx: any) => {
      if (ctx?.previous) queryClient.setQueryData(["customers"], ctx.previous);
      toast({
        title: "Error",
        description: err.message || "Failed to update customer",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onSuccess: () => {
      toast({
        title: "Customer Updated",
        description: "Customer has been updated successfully",
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["customers"] });
      const previous = queryClient.getQueryData(["customers"]);
      queryClient.setQueryData(["customers"], (old: any) =>
        old ? old.filter((c: any) => c.id !== id) : []
      );
      return { previous };
    },
    onError: (err, variables, ctx: any) => {
      if (ctx?.previous) queryClient.setQueryData(["customers"], ctx.previous);
      toast({
        title: "Error",
        description: err.message || "Failed to delete customer",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onSuccess: () => {
      toast({
        title: "Customer Deleted",
        description: "Customer has been deleted successfully",
      });
    },
  });
};

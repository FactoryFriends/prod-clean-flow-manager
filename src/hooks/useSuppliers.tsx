import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) {
        // Handle the case where user doesn't have permission
        if (error.code === 'PGRST116' || error.message.includes('permission')) {
          toast.error("You don't have permission to view suppliers. Admin access required.");
          return [];
        }
        throw error;
      }
      return data as Supplier[];
    },
  });
};

export const useAllSuppliers = () => {
  return useQuery({
    queryKey: ["all-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (error) {
        // Handle the case where user doesn't have permission
        if (error.code === 'PGRST116' || error.message.includes('permission')) {
          toast.error("You don't have permission to view suppliers. Admin access required.");
          return [];
        }
        throw error;
      }
      return data as Supplier[];
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, "id" | "active">) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({ ...supplier })
        .select()
        .single();
      if (error) throw error;
      return data as Supplier;
    },
    onMutate: async (newSupplier) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      await queryClient.cancelQueries({ queryKey: ["all-suppliers"] });
      const previous = queryClient.getQueryData(["suppliers"]);
      const previousAll = queryClient.getQueryData(["all-suppliers"]);
      const fakeId = "optimistic-" + Date.now();
      const optimistic = { id: fakeId, ...newSupplier, active: true };
      if (previous) queryClient.setQueryData(["suppliers"], (old: any) => [...old, optimistic]);
      if (previousAll) queryClient.setQueryData(["all-suppliers"], (old: any) => [...old, optimistic]);
      return { previous, previousAll };
    },
    onError: (err, variables, ctx: any) => {
      if (ctx?.previous) queryClient.setQueryData(["suppliers"], ctx.previous);
      if (ctx?.previousAll) queryClient.setQueryData(["all-suppliers"], ctx.previousAll);
      toast.error("Failed to add supplier: " + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["all-suppliers"] });
    },
    onSuccess: () => {
      toast.success("Supplier added successfully");
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...supplier
    }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(supplier)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Supplier;
    },
    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      await queryClient.cancelQueries({ queryKey: ["all-suppliers"] });
      const previous = queryClient.getQueryData(["suppliers"]);
      const previousAll = queryClient.getQueryData(["all-suppliers"]);
      queryClient.setQueryData(["suppliers"], (old: any) =>
        old ? old.map((s: any) => s.id === update.id ? { ...s, ...update } : s) : []
      );
      queryClient.setQueryData(["all-suppliers"], (old: any) =>
        old ? old.map((s: any) => s.id === update.id ? { ...s, ...update } : s) : []
      );
      return { previous, previousAll };
    },
    onError: (err, variables, ctx: any) => {
      if (ctx?.previous) queryClient.setQueryData(["suppliers"], ctx.previous);
      if (ctx?.previousAll) queryClient.setQueryData(["all-suppliers"], ctx.previousAll);
      toast.error("Failed to update supplier: " + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["all-suppliers"] });
    },
    onSuccess: () => {
      toast.success("Supplier updated successfully");
    },
  });
};

export const useDeactivateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .update({ active: false })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      await queryClient.cancelQueries({ queryKey: ["all-suppliers"] });
      const previous = queryClient.getQueryData(["suppliers"]);
      const previousAll = queryClient.getQueryData(["all-suppliers"]);
      queryClient.setQueryData(["suppliers"], (old: any) =>
        old ? old.filter((s: any) => s.id !== id) : []
      );
      queryClient.setQueryData(["all-suppliers"], (old: any) =>
        old ? old.filter((s: any) => s.id !== id) : []
      );
      return { previous, previousAll };
    },
    onError: (err, variables, ctx: any) => {
      if (ctx?.previous) queryClient.setQueryData(["suppliers"], ctx.previous);
      if (ctx?.previousAll) queryClient.setQueryData(["all-suppliers"], ctx.previousAll);
      toast.error("Failed to deactivate supplier: " + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["all-suppliers"] });
    },
    onSuccess: () => {
      toast.success("Supplier deactivated");
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  unit_size: number;
  unit_type: string;
  packages_per_batch: number;
  shelf_life_days: number | null;
  price_per_unit: number | null;
  active: boolean;
  product_type: string; // 'zelfgemaakt' | 'extern' | 'ingredient' | 'semi-finished' | 'dish'
  supplier_name: string | null;
  pickable?: boolean; // <-- ADDED to match database and UI usage
  supplier_id?: string | null; // <-- ADDED!
  product_fiche_url?: string | null; // <-- ADDED!
  description?: string;
  labour_time_minutes?: number | null;
  // NEW fields for margin/cost/tracking:
  cost?: number | null;
  markup_percent?: number | null;
  sales_price?: number | null;
  minimal_margin_threshold_percent?: number | null;
  product_kind: string; // <-- Add this line for TS support!
}

export interface Chef {
  id: string;
  name: string;
  location: "tothai" | "khin";
  active: boolean;
}

export interface ProductionBatch {
  id: string;
  batch_number: string;
  product_id: string;
  chef_id: string;
  packages_produced: number;
  production_date: string;
  expiry_date: string;
  production_notes?: string;
  location: "tothai" | "khin";
  created_at: string;
  products: Product;
  chefs: Chef;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData: any) => {
      // Track cost history if cost is provided
      // We'll create it after insert
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      // Insert cost history if needed
      if (productData.cost != null) {
        await supabase
          .from("product_cost_history")
          .insert({
            product_id: data.id,
            old_cost: null,
            new_cost: productData.cost,
            changed_by: "system or user", // Can replace with real user later
          });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create product: " + error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      // Fetch current product cost first for history
      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("cost")
        .eq("id", id)
        .maybeSingle();
      if (fetchError) throw fetchError;

      const currentCost = existingProduct?.cost ?? null;
      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      // Track cost change if cost updated
      if (
        productData.cost != null &&
        productData.cost !== currentCost
      ) {
        await supabase
          .from("product_cost_history")
          .insert({
            product_id: id,
            old_cost: currentCost,
            new_cost: productData.cost,
            changed_by: "system or user", // fill later
          });
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update product: " + error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .update({ active: false })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      toast.success("Product deactivated successfully");
    },
    onError: (error) => {
      toast.error("Failed to deactivate product: " + error.message);
    },
  });
};

export const useChefs = (location?: "tothai" | "khin") => {
  return useQuery({
    queryKey: ["chefs", location],
    queryFn: async () => {
      let query = supabase
        .from("chefs")
        .select("*")
        .eq("active", true);
      
      if (location) {
        query = query.eq("location", location);
      }
      
      const { data, error } = await query.order("name");
      
      if (error) throw error;
      return data as Chef[];
    },
  });
};

export const useProductionBatches = (location?: "tothai" | "khin") => {
  return useQuery({
    queryKey: ["production-batches", location],
    queryFn: async () => {
      let query = supabase
        .from("production_batches")
        .select(`
          *,
          products(*),
          chefs(*)
        `);
      
      if (location) {
        query = query.eq("location", location);
      }
      
      const { data, error } = await query
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ProductionBatch[];
    },
  });
};

export const useCreateProductionBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (batchData: {
      product_id: string;
      chef_id: string;
      packages_produced: number;
      expiry_date: string;
      production_notes?: string;
      location: "tothai" | "khin";
    }) => {
      // First get the product name for batch number generation
      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", batchData.product_id)
        .single();
      
      if (!product) throw new Error("Product not found");
      
      // Generate batch number
      const { data: batchNumber } = await supabase
        .rpc("generate_batch_number", {
          product_name: product.name,
          production_date: new Date().toISOString().split('T')[0]
        });
      
      if (!batchNumber) throw new Error("Failed to generate batch number");
      
      // Create the batch
      const { data, error } = await supabase
        .from("production_batches")
        .insert({
          ...batchData,
          batch_number: batchNumber,
        })
        .select(`
          *,
          products(*),
          chefs(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      toast.success("Production batch created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create production batch: " + error.message);
    },
  });
};

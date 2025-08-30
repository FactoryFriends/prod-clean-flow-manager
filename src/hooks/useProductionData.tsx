import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  unit_size: number;
  unit_type: string;
  packages_per_batch: number;
  shelf_life_days?: number | null;
  price_per_unit?: number | null;
  active: boolean;
  product_type: string; // 'zelfgemaakt' | 'extern' | 'ingredient' | 'semi-finished' | 'dish'
  supplier_name?: string | null;
  pickable: boolean; // <-- ADDED to match database and UI usage
  supplier_id?: string | null; // <-- ADDED!
  product_fiche_url?: string | null; // <-- ADDED!
  cost?: number;
  markup_percent?: number;
  sales_price?: number;
  minimal_margin_threshold_percent?: number;
  // NEW FIELDS ADDED FOR PACKAGE STRUCTURE
  supplier_package_unit?: string | null;
  units_per_package?: number | null;
  inner_unit_type?: string | null;
  price_per_package?: number | null;
  // Add any other fields present in your schema you need!
  [key: string]: any; // enable extra props for function compatibility
}

export interface Chef {
  id: string;
  name: string;
  location: "tothai" | "khin";
  active: boolean;
  created_at: string;
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
  items_per_package?: number;
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
        .eq("product_type", "zelfgemaakt") // Only show self-made products for production batches
        .order("name");
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      console.log("Products loaded:", data);
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
      
      if (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }
      
      console.log("All products loaded:", data);
      return data as Product[];
    },
  });
};

export const useExternalProducts = () => {
  return useQuery({
    queryKey: ["external-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .in("product_type", ["extern"])
        .order("name");
      
      if (error) {
        console.error("Error fetching external products:", error);
        throw error;
      }
      
      console.log("External products loaded:", data);
      return data as Product[];
    },
  });
};

export const useIngredientProducts = () => {
  return useQuery({
    queryKey: ["ingredient-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("product_type", "ingredient")
        .order("name");
      
      if (error) {
        console.error("Error fetching ingredient products:", error);
        throw error;
      }
      
      console.log("Ingredient products loaded:", data);
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
    // Optimistic update:
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      await queryClient.cancelQueries({ queryKey: ["all-products"] });
      const previousData = queryClient.getQueryData(["products"]);
      const previousAll = queryClient.getQueryData(["all-products"]);
      const fakeId = "optimistic-" + Date.now();

      // Optimistically add
      const optimisticProduct = { id: fakeId, ...newProduct, active: true };
      if (previousData) {
        queryClient.setQueryData(["products"], (old: any) =>
          old ? [...old, optimisticProduct] : [optimisticProduct]
        );
      }
      if (previousAll) {
        queryClient.setQueryData(["all-products"], (old: any) =>
          old ? [...old, optimisticProduct] : [optimisticProduct]
        );
      }
      return { previousData, previousAll };
    },
    onError: (err, variables, context: any) => {
      // Rollback
      if (context?.previousData) queryClient.setQueryData(["products"], context.previousData);
      if (context?.previousAll) queryClient.setQueryData(["all-products"], context.previousAll);
      const errorMessage = err.message?.includes('permission') 
        ? "You don't have permission to create products. Admin access required."
        : "Failed to create product: " + (err.message || "Unknown error");
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
    },
    onSuccess: () => {
      toast.success("Product created successfully");
    }
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
    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      await queryClient.cancelQueries({ queryKey: ["all-products"] });
      // Optimistically update
      const previousData = queryClient.getQueryData(["products"]);
      const previousAll = queryClient.getQueryData(["all-products"]);
      queryClient.setQueryData(["products"], (old: any) =>
        old ? old.map((p: any) => p.id === update.id ? { ...p, ...update } : p) : []
      );
      queryClient.setQueryData(["all-products"], (old: any) =>
        old ? old.map((p: any) => p.id === update.id ? { ...p, ...update } : p) : []
      );
      return { previousData, previousAll };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousData) queryClient.setQueryData(["products"], context.previousData);
      if (context?.previousAll) queryClient.setQueryData(["all-products"], context.previousAll);
      toast.error("Failed to update product: " + (err.message || "Unknown error"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
    }
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      await queryClient.cancelQueries({ queryKey: ["all-products"] });
      const previousData = queryClient.getQueryData(["products"]);
      const previousAll = queryClient.getQueryData(["all-products"]);
      // Optimistically remove from active products list
      queryClient.setQueryData(["products"], (old: any) =>
        old ? old.filter((p: any) => p.id !== id) : []
      );
      // Optimistically set active: false in all-products list
      queryClient.setQueryData(["all-products"], (old: any) =>
        old ? old.map((p: any) => p.id === id ? { ...p, active: false } : p) : []
      );
      return { previousData, previousAll };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousData) queryClient.setQueryData(["products"], context.previousData);
      if (context?.previousAll) queryClient.setQueryData(["all-products"], context.previousAll);
      toast.error("Failed to deactivate product: " + (err.message || "Unknown error"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
    },
    onSuccess: () => {
      toast.success("Product deactivated successfully");
    }
  });
};

export const usePermanentDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      await queryClient.cancelQueries({ queryKey: ["all-products"] });
      const previousData = queryClient.getQueryData(["products"]);
      const previousAll = queryClient.getQueryData(["all-products"]);
      // Optimistically remove
      queryClient.setQueryData(["products"], (old: any) =>
        old ? old.filter((p: any) => p.id !== id) : []
      );
      queryClient.setQueryData(["all-products"], (old: any) =>
        old ? old.filter((p: any) => p.id !== id) : []
      );
      return { previousData, previousAll };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousData) queryClient.setQueryData(["products"], context.previousData);
      if (context?.previousAll) queryClient.setQueryData(["all-products"], context.previousAll);
      toast.error("Failed to permanently delete ingredient: " + (err.message || "Unknown error"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
    },
    onSuccess: () => {
      toast.success("Ingredient permanently deleted.");
    }
  });
};

export const useReplaceIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Args: { oldIngredientId: string, newIngredientId: string }
    mutationFn: async ({
      oldIngredientId,
      newIngredientId,
    }: {
      oldIngredientId: string;
      newIngredientId: string;
    }) => {
      // NOTE: No-op: actual recipe relationships are not present in the 'products' table schema.
      // To fully implement REPLACE, recipes must be linked via a join table or other structure.

      // For now, just resolve with a dummy result.
      return { updated: 0 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      // Let caller handle toast
    },
    onError: (error) => {
      // Let caller handle toast
      console.error(error);
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
      
      if (error) {
        console.error("Error fetching production batches:", error);
        throw error;
      }
      
      console.log("Production batches loaded:", data);
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
      const errorMessage = error.message?.includes('permission') 
        ? "You don't have permission to create production batches. Please sign in."
        : "Failed to create production batch: " + error.message;
      toast.error(errorMessage);
    },
  });
};

export const useUpdateProductionBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...batchData }: {
      id: string;
      chef_id?: string;
      packages_produced?: number;
      expiry_date?: string;
      production_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("production_batches")
        .update(batchData)
        .eq("id", id)
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
      toast.success("Production batch updated successfully");
    },
    onError: (error) => {
      const errorMessage = error.message?.includes('permission') 
        ? "You don't have permission to update production batches. Please sign in."
        : "Failed to update production batch: " + error.message;
      toast.error(errorMessage);
    },
  });
};

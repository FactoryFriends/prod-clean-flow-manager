
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BatchWithStock {
  id: string;
  batch_number: string;
  created_at: string;
  production_date: string;
  expiry_date: string;
  packages_produced: number;
  packages_in_stock: number;
  products?: {
    name?: string;
    unit_type?: string;
  } | null;
  chefs?: {
    name?: string;
  } | null;
}

export const useBatchStock = ({
  location,
  search = "",
  inStockOnly = true,
}: { location?: "tothai" | "khin"; search?: string; inStockOnly?: boolean }) => {
  return useQuery({
    queryKey: ["batches-in-stock", location, search, inStockOnly],
    queryFn: async () => {
      // Fetch all batches and their base data
      let batchQuery = supabase
        .from("production_batches")
        .select(
          `
            *,
            products (name, unit_type),
            chefs (name)
          `
        )
        .order("created_at", { ascending: false });

      if (location) {
        batchQuery = batchQuery.eq("location", location);
      }
      if (search) {
        batchQuery = batchQuery.ilike("batch_number", `%${search}%`);
      }
      const { data: batches, error } = await batchQuery;
      if (error) throw error;
      if (!batches) return [];

      // For all batches, fetch dispatched amounts
      // Build a map: batch_id -> total moved out (sum of dispatch_items.quantity)
      const batchIds = batches.map((b: any) => b.id);
      if (batchIds.length === 0) return [];

      // Only count dispatch items from confirmed dispatches
      const { data: dispatchItems, error: diErr } = await supabase
        .from("dispatch_items")
        .select(`
          item_id, 
          quantity,
          dispatch_records!inner(status)
        `)
        .in("item_id", batchIds)
        .eq("item_type", "batch")
        .eq("dispatch_records.status", "confirmed");
      if (diErr) {
        // Handle authentication errors gracefully
        if (diErr.code === 'PGRST116' || diErr.message?.includes('permission')) {
          toast.error("Please sign in to view dispatch information");
          // Continue with empty dispatch items to show available stock
          return batches.map((batch: any) => ({
            ...batch,
            available_quantity: batch.packages_produced,
            used_quantity: 0
          }));
        }
        throw diErr;
      }

      const usedMap: Record<string, number> = {};
      dispatchItems?.forEach((item: any) => {
        if (!usedMap[item.item_id]) usedMap[item.item_id] = 0;
        usedMap[item.item_id] += item.quantity;
      });

      // Prepare output array
      const allBatches: BatchWithStock[] = batches.map((b: any) => {
        const used = usedMap[b.id] || 0;
        const packages_in_stock = Math.max(0, (b.packages_produced + (b.manual_stock_adjustment || 0)) - used);
        return {
          ...b,
          packages_in_stock,
        };
      });

      // Filter for in-stock only if requested
      return inStockOnly
        ? allBatches.filter((b) => b.packages_in_stock > 0)
        : allBatches;
    },
  });
};

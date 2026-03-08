
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
    inner_unit_type?: string;
    unit_size?: number;
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
      // Fetch batches — pre-filter on packages_produced > 0 when inStockOnly
      let batchQuery = supabase
        .from("production_batches")
        .select(
          `
            *,
            products (name, unit_type, inner_unit_type, unit_size),
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
      // Pre-filter: skip batches with 0 produced when we only want in-stock
      if (inStockOnly) {
        batchQuery = batchQuery.gt("packages_produced", 0);
      }
      const { data: batches, error } = await batchQuery;
      if (error) throw error;
      if (!batches) return [];

      const batchIds = batches.map((b: any) => b.id);
      if (batchIds.length === 0) return [];

      // Chunk helper: split IDs into groups of 100 to avoid URL length limits
      const CHUNK_SIZE = 100;
      const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const allDispatchItems: any[] = [];

      for (let i = 0; i < batchIds.length; i += CHUNK_SIZE) {
        const chunk = batchIds.slice(i, i + CHUNK_SIZE);
        const { data: items, error: diErr } = await supabase
          .from("dispatch_items")
          .select(`
            item_id, 
            quantity,
            dispatch_records!inner(status, created_at)
          `)
          .in("item_id", chunk)
          .eq("item_type", "batch")
          .eq("dispatch_records.status", "draft")
          .gte("dispatch_records.created_at", cutoff24h);

        if (diErr) {
          if (diErr.code === 'PGRST116' || diErr.message?.includes('permission')) {
            toast.error("Please sign in to view dispatch information");
            return batches.map((batch: any) => ({
              ...batch,
              available_quantity: batch.packages_produced,
              used_quantity: 0
            }));
          }
          throw diErr;
        }
        if (items) allDispatchItems.push(...items);
      }

      const reservedMap: Record<string, number> = {};
      allDispatchItems.forEach((item: any) => {
        if (!reservedMap[item.item_id]) reservedMap[item.item_id] = 0;
        reservedMap[item.item_id] += item.quantity;
      });

      // Prepare output array
      const allBatches: BatchWithStock[] = batches.map((b: any) => {
        const reserved = reservedMap[b.id] || 0;
        const packages_in_stock = Math.max(0, (b.packages_produced + (b.manual_stock_adjustment || 0)) - reserved);
        return {
          ...b,
          packages_in_stock,
        };
      });

      // Filter for in-stock only if requested (include expired batches so they appear in stock verification)
      return inStockOnly
        ? allBatches.filter((b) => b.packages_in_stock > 0)
        : allBatches;
    },
  });
};

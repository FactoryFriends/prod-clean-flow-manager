
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PriceHistoryRecord {
  id: string;
  product_id: string;
  old_cost: number | null;
  new_cost: number;
  changed_at: string;
  changed_by: string | null;
  product_name: string;
  supplier_name: string | null;
  product_type: string;
  supplier_package_unit: string | null;
}

export const useProductPriceHistory = (filters?: {
  startDate?: Date;
  endDate?: Date;
  productType?: string;
  supplierId?: string;
}) => {
  return useQuery({
    queryKey: ["product-price-history", filters],
    queryFn: async () => {
      let query = supabase
        .from("product_cost_history")
        .select(`
          *,
          products!inner(
            name,
            supplier_name,
            product_type,
            supplier_package_unit,
            supplier_id
          )
        `)
        .order("changed_at", { ascending: false });

      if (filters?.startDate) {
        query = query.gte("changed_at", filters.startDate.toISOString());
      }
      
      if (filters?.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("changed_at", endOfDay.toISOString());
      }

      if (filters?.productType && filters.productType !== "all") {
        query = query.eq("products.product_type", filters.productType);
      }

      if (filters?.supplierId && filters.supplierId !== "all") {
        query = query.eq("products.supplier_id", filters.supplierId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((record: any) => ({
        id: record.id,
        product_id: record.product_id,
        old_cost: record.old_cost,
        new_cost: record.new_cost,
        changed_at: record.changed_at,
        changed_by: record.changed_by,
        product_name: record.products.name,
        supplier_name: record.products.supplier_name,
        product_type: record.products.product_type,
        supplier_package_unit: record.products.supplier_package_unit,
      })) as PriceHistoryRecord[];
    },
  });
};


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";

export interface InvoiceProposalItem {
  productName: string;
  productId: string;
  unitSize: number;
  unitType: string;
  pricePerUnit: number;
  totalQuantity: number;
  totalAmount: number;
  packingSlipCount: number;
}

export interface InvoiceProposal {
  items: InvoiceProposalItem[];
  totalAmount: number;
  periodStart: string;
  periodEnd: string;
  packingSlipCount: number;
}

export const useInvoiceProposal = (
  currentLocation: "tothai" | "khin",
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ["invoice-proposal", currentLocation, startDate, endDate],
    queryFn: async (): Promise<InvoiceProposal> => {
      console.log("Fetching invoice proposal for:", { currentLocation, startDate, endDate });

      // Get packing slips with their batch information for the period
      const { data: packingSlips, error } = await supabase
        .from("packing_slips")
        .select(`
          id,
          slip_number,
          created_at,
          batch_ids,
          dispatch_records!inner (
            location,
            dispatch_type
          )
        `)
        .eq("dispatch_records.location", currentLocation)
        .eq("dispatch_records.dispatch_type", "external")
        .gte("created_at", startOfDay(new Date(startDate)).toISOString())
        .lte("created_at", endOfDay(new Date(endDate)).toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching packing slips:", error);
        throw error;
      }

      console.log("Found packing slips:", packingSlips?.length || 0);

      if (!packingSlips || packingSlips.length === 0) {
        return {
          items: [],
          totalAmount: 0,
          periodStart: startDate,
          periodEnd: endDate,
          packingSlipCount: 0
        };
      }

      // Collect all batch IDs from packing slips
      const allBatchIds = packingSlips.flatMap(slip => slip.batch_ids || []);
      const uniqueBatchIds = [...new Set(allBatchIds)];

      console.log("Unique batch IDs found:", uniqueBatchIds.length);

      if (uniqueBatchIds.length === 0) {
        return {
          items: [],
          totalAmount: 0,
          periodStart: startDate,
          periodEnd: endDate,
          packingSlipCount: packingSlips.length
        };
      }

      // Get dispatch items for these batches to get quantities
      const { data: dispatchItems, error: dispatchError } = await supabase
        .from("dispatch_items")
        .select(`
          item_id,
          item_name,
          quantity,
          dispatch_id,
          dispatch_records!inner (
            location,
            dispatch_type
          )
        `)
        .in("item_id", uniqueBatchIds)
        .eq("item_type", "batch")
        .eq("dispatch_records.location", currentLocation)
        .eq("dispatch_records.dispatch_type", "external");

      if (dispatchError) {
        console.error("Error fetching dispatch items:", dispatchError);
        throw dispatchError;
      }

      console.log("Found dispatch items:", dispatchItems?.length || 0);

      // Get batch and product information
      const { data: batches, error: batchError } = await supabase
        .from("production_batches")
        .select(`
          id,
          batch_number,
          products (
            id,
            name,
            unit_size,
            unit_type,
            price_per_unit
          )
        `)
        .in("id", uniqueBatchIds);

      if (batchError) {
        console.error("Error fetching batches:", batchError);
        throw batchError;
      }

      console.log("Found batches with products:", batches?.length || 0);

      // Group by product and calculate totals
      const productTotals = new Map<string, InvoiceProposalItem>();

      dispatchItems?.forEach(item => {
        const batch = batches?.find(b => b.id === item.item_id);
        if (!batch || !batch.products) return;

        const product = batch.products;
        if (!product.price_per_unit) return; // Skip products without price

        const productKey = product.id;
        
        if (productTotals.has(productKey)) {
          const existing = productTotals.get(productKey)!;
          existing.totalQuantity += item.quantity;
          existing.totalAmount = existing.totalQuantity * existing.pricePerUnit;
        } else {
          productTotals.set(productKey, {
            productName: product.name,
            productId: product.id,
            unitSize: product.unit_size,
            unitType: product.unit_type,
            pricePerUnit: product.price_per_unit,
            totalQuantity: item.quantity,
            totalAmount: item.quantity * product.price_per_unit,
            packingSlipCount: 0 // Will be calculated below
          });
        }
      });

      // Calculate packing slip count per product
      productTotals.forEach((item, productId) => {
        const productBatchIds = batches
          ?.filter(b => b.products?.id === productId)
          .map(b => b.id) || [];
        
        const slipsWithProduct = packingSlips.filter(slip => 
          slip.batch_ids?.some(batchId => productBatchIds.includes(batchId))
        );
        
        item.packingSlipCount = slipsWithProduct.length;
      });

      const items = Array.from(productTotals.values()).sort((a, b) => 
        a.productName.localeCompare(b.productName)
      );

      const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

      console.log("Invoice proposal generated:", {
        itemCount: items.length,
        totalAmount,
        packingSlipCount: packingSlips.length
      });

      return {
        items,
        totalAmount,
        periodStart: startDate,
        periodEnd: endDate,
        packingSlipCount: packingSlips.length
      };
    },
    enabled: !!startDate && !!endDate,
  });
};

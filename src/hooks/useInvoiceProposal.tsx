
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  isExternal: boolean;
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
  endDate: string,
  productTypeFilter: "self-produced" | "external" | "both" = "self-produced"
) => {
  return useQuery({
    queryKey: ["invoice-proposal", currentLocation, startDate, endDate, productTypeFilter],
    queryFn: async (): Promise<InvoiceProposal> => {
      console.log("Fetching invoice proposal for:", { currentLocation, startDate, endDate, productTypeFilter });

      // Get packing slips with their dispatch record information for the period
      const { data: packingSlips, error } = await supabase
        .from("packing_slips")
        .select(`
          id,
          slip_number,
          created_at,
          batch_ids,
          dispatch_id,
          dispatch_records!inner (
            id,
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

      // Get all dispatch IDs from packing slips
      const dispatchIds = packingSlips.map(slip => slip.dispatch_id).filter(Boolean);

      console.log("Unique batch IDs found:", uniqueBatchIds.length);
      console.log("Dispatch IDs found:", dispatchIds.length);

      const productTotals = new Map<string, InvoiceProposalItem>();

      // Handle self-produced products (from batches)
      if ((productTypeFilter === "self-produced" || productTypeFilter === "both") && uniqueBatchIds.length > 0) {
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
          // Handle authentication errors gracefully
          if (dispatchError.code === 'PGRST116' || dispatchError.message?.includes('permission')) {
            toast.error("Please sign in to access invoice data");
            return {
              items: [],
              totalAmount: 0,
              periodStart: startDate,
              periodEnd: endDate,
              packingSlipCount: 0
            };
          }
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

        // Process self-produced items
        dispatchItems?.forEach(item => {
          const batch = batches?.find(b => b.id === item.item_id);
          if (!batch || !batch.products) return;

          const product = batch.products;
          const pricePerUnit = product.price_per_unit || 0;

          const productKey = `self-${product.id}`;
          
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
              pricePerUnit: pricePerUnit,
              totalQuantity: item.quantity,
              totalAmount: item.quantity * pricePerUnit,
              packingSlipCount: 0, // Will be calculated below
              isExternal: false
            });
          }
        });

        // Calculate packing slip count per self-produced product
        productTotals.forEach((item, productKey) => {
          if (!item.isExternal) {
            const productId = item.productId;
            const productBatchIds = batches
              ?.filter(b => b.products?.id === productId)
              .map(b => b.id) || [];
            
            const slipsWithProduct = packingSlips.filter(slip => 
              slip.batch_ids?.some(batchId => productBatchIds.includes(batchId))
            );
            
            item.packingSlipCount = slipsWithProduct.length;
          }
        });
      }

      // Handle external products
      if ((productTypeFilter === "external" || productTypeFilter === "both") && dispatchIds.length > 0) {
        // Get dispatch items for external products from our specific dispatch records
        const { data: externalDispatchItems, error: externalDispatchError } = await supabase
          .from("dispatch_items")
          .select(`
            item_id,
            item_name,
            quantity,
            dispatch_id
          `)
          .in("dispatch_id", dispatchIds)
          .eq("item_type", "external");

        if (externalDispatchError) {
          // Handle authentication errors gracefully
          if (externalDispatchError.code === 'PGRST116' || externalDispatchError.message?.includes('permission')) {
            console.warn("User does not have permission to view external dispatch items");
            // Continue without external items instead of failing completely
          } else {
            console.error("Error fetching external dispatch items:", externalDispatchError);
            throw externalDispatchError;
          }
        }

        console.log("Found external dispatch items:", externalDispatchItems?.length || 0);

        // Process external items (note: they typically don't have prices in the system)
        externalDispatchItems?.forEach(item => {
          const productKey = `external-${item.item_id}`;
          
          if (productTotals.has(productKey)) {
            const existing = productTotals.get(productKey)!;
            existing.totalQuantity += item.quantity;
            existing.totalAmount = existing.totalQuantity * existing.pricePerUnit;
          } else {
            productTotals.set(productKey, {
              productName: item.item_name,
              productId: item.item_id,
              unitSize: 1, // Default for external products
              unitType: "stuk", // Default unit type
              pricePerUnit: 0, // External products typically don't have prices set
              totalQuantity: item.quantity,
              totalAmount: 0, // No price available
              packingSlipCount: 0, // Will be calculated below
              isExternal: true
            });
          }
        });

        // Calculate packing slip count per external product
        productTotals.forEach((item, productKey) => {
          if (item.isExternal) {
            const productId = item.productId;
            const slipsWithProduct = packingSlips.filter(slip => {
              // Check if any dispatch items in this slip contain this external product
              return externalDispatchItems?.some(extItem => 
                extItem.item_id === productId && 
                extItem.dispatch_id === slip.dispatch_id
              );
            });
            
            item.packingSlipCount = slipsWithProduct.length;
          }
        });
      }

      const items = Array.from(productTotals.values()).sort((a, b) => {
        // Sort by type first (self-produced first), then by name
        if (a.isExternal !== b.isExternal) {
          return a.isExternal ? 1 : -1;
        }
        return a.productName.localeCompare(b.productName);
      });

      const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

      console.log("Invoice proposal generated:", {
        itemCount: items.length,
        totalAmount,
        packingSlipCount: packingSlips.length,
        productTypeFilter
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

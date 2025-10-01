import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStockAdjustment } from "./useStockAdjustment";
import type { StockAdjustmentRow } from "@/utils/excel/stockVerificationParser";

interface BatchMatch {
  row: StockAdjustmentRow;
  batchId: string | null;
  error?: string;
}

interface BulkAdjustmentResult {
  successful: number;
  failed: number;
  errors: Array<{ batchNumber: string; error: string }>;
}

export const useBulkStockAdjustment = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const matchBatchesToDatabase = async (rows: StockAdjustmentRow[]): Promise<BatchMatch[]> => {
    const batchNumbers = rows.map(r => r.batchNumber);
    
    const { data: batches, error } = await supabase
      .from("production_batches")
      .select("id, batch_number")
      .in("batch_number", batchNumbers);

    if (error) {
      throw new Error(`Failed to fetch batches: ${error.message}`);
    }

    const batchMap = new Map(batches?.map(b => [b.batch_number, b.id]) || []);

    return rows.map(row => ({
      row,
      batchId: batchMap.get(row.batchNumber) || null,
      error: !batchMap.has(row.batchNumber) ? "Batch not found in database" : undefined
    }));
  };

  const executeBulkAdjustment = useMutation({
    mutationFn: async ({ 
      matches, 
      adjustedBy, 
      reason 
    }: { 
      matches: BatchMatch[]; 
      adjustedBy: string; 
      reason: string;
    }): Promise<BulkAdjustmentResult> => {
      const validMatches = matches.filter(m => m.batchId && !m.error);
      const result: BulkAdjustmentResult = {
        successful: 0,
        failed: 0,
        errors: []
      };

      setProgress({ current: 0, total: validMatches.length });

      for (let i = 0; i < validMatches.length; i++) {
        const match = validMatches[i];
        
        try {
          // Get current batch data
          const { data: batch, error: batchError } = await supabase
            .from("production_batches")
            .select("packages_produced, manual_stock_adjustment")
            .eq("id", match.batchId!)
            .single();

          if (batchError) throw batchError;

          // Get dispatched quantity
          const { data: dispatchItems, error: dispatchError } = await supabase
            .from("dispatch_items")
            .select("quantity")
            .eq("item_id", match.batchId!)
            .eq("item_type", "batch");

          if (dispatchError) throw dispatchError;

          const totalDispatched = dispatchItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          const currentAdjustment = batch.manual_stock_adjustment || 0;
          
          // Calculate new adjustment
          const newAdjustment = match.row.physicalCount - batch.packages_produced + totalDispatched;

          // Update batch
          const { error: updateError } = await supabase
            .from("production_batches")
            .update({
              manual_stock_adjustment: newAdjustment,
              adjusted_by: adjustedBy,
              adjustment_reason: reason,
              adjustment_timestamp: new Date().toISOString(),
            })
            .eq("id", match.batchId!);

          if (updateError) throw updateError;

          // Log audit trail
          await supabase.from("audit_logs").insert({
            action_type: "stock_adjustment",
            action_description: `Bulk stock adjustment: ${match.row.batchNumber} from ${batch.packages_produced + currentAdjustment - totalDispatched} to ${match.row.physicalCount}`,
            reference_type: "production_batch",
            reference_id: match.batchId!,
            staff_name: adjustedBy,
            metadata: {
              old_remaining_stock: batch.packages_produced + currentAdjustment - totalDispatched,
              new_remaining_stock: match.row.physicalCount,
              adjustment_reason: reason,
              old_adjustment: currentAdjustment,
              new_adjustment: newAdjustment,
              bulk_import: true,
            },
            favv_relevant: true,
          });

          result.successful++;
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            batchNumber: match.row.batchNumber,
            error: error.message || "Unknown error"
          });
        }

        setProgress({ current: i + 1, total: validMatches.length });
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["batches-in-stock"] });
      
      if (result.failed === 0) {
        toast.success(`Successfully adjusted ${result.successful} batches`);
      } else {
        toast.warning(`Adjusted ${result.successful} batches, ${result.failed} failed`);
      }
      
      setProgress(null);
    },
    onError: (error: any) => {
      toast.error(`Bulk adjustment failed: ${error.message}`);
      setProgress(null);
    },
  });

  return {
    matchBatchesToDatabase,
    executeBulkAdjustment,
    progress
  };
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseUnifiedOperationsDataProps {
  locationFilter: "all" | "tothai" | "khin";
  startDate?: Date;
  endDate?: Date;
  operationType: "all" | "external" | "internal";
  enabled?: boolean;
}

export interface UnifiedOperation {
  id: string;
  type: 'EXTERNAL' | 'INTERNAL';
  reference_number: string;
  date: string;
  location: string;
  destination: string;
  total_items: number;
  total_packages: number;
  picker_name: string;
  details: any; // Raw data for modal display
}

export function useUnifiedOperationsData({ 
  locationFilter, 
  startDate, 
  endDate, 
  operationType,
  enabled = true 
}: UseUnifiedOperationsDataProps) {
  return useQuery({
    queryKey: ["unified-operations", locationFilter, startDate, endDate, operationType],
    queryFn: async (): Promise<UnifiedOperation[]> => {
      const operations: UnifiedOperation[] = [];
      
      // Fetch external operations (packing slips)
      if (operationType === "all" || operationType === "external") {
        const { data: packingSlips, error: packingSlipError } = await supabase
          .from("packing_slips")
          .select(`
            *,
            dispatch_records (
              location,
              dispatch_type,
              customer,
              picker_name,
              dispatch_notes
            )
          `)
          .eq("status", "shipped")
          .order("created_at", { ascending: false });

        if (packingSlipError) {
          console.error("Error fetching packing slips:", packingSlipError);
          throw packingSlipError;
        }

        // Convert packing slips to unified format
        const externalOperations: UnifiedOperation[] = (packingSlips || []).map(slip => ({
          id: slip.id,
          type: 'EXTERNAL' as const,
          reference_number: slip.slip_number || slip.id.slice(0, 8),
          date: slip.created_at,
          location: slip.dispatch_records?.location || "khin",
          destination: slip.destination,
          total_items: slip.total_items,
          total_packages: slip.total_packages,
          picker_name: slip.dispatch_records?.picker_name || slip.picked_up_by || "N/A",
          details: slip
        }));

        operations.push(...externalOperations);
      }
      
      // Fetch internal operations (internal dispatches)
      if (operationType === "all" || operationType === "internal") {
        const { data: internalDispatches, error: internalError } = await supabase
          .from("dispatch_records")
          .select(`
            *,
            dispatch_items (*)
          `)
          .eq("dispatch_type", "internal")
          .eq("status", "confirmed")
          .order("created_at", { ascending: false });

        if (internalError) {
          console.error("Error fetching internal dispatches:", internalError);
          throw internalError;
        }

        // Convert internal dispatches to unified format
        const internalOperations: UnifiedOperation[] = (internalDispatches || []).map(dispatch => ({
          id: dispatch.id,
          type: 'INTERNAL' as const,
          reference_number: dispatch.id.slice(0, 8).toUpperCase(),
          date: dispatch.created_at,
          location: dispatch.location,
          destination: "Kitchen Use",
          total_items: dispatch.total_items,
          total_packages: dispatch.total_packages,
          picker_name: dispatch.picker_name,
          details: dispatch
        }));

        operations.push(...internalOperations);
      }

      // Apply date filters
      let filteredOperations = operations;
      
      if (startDate) {
        filteredOperations = filteredOperations.filter(op => 
          new Date(op.date) >= startDate
        );
      }
      
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filteredOperations = filteredOperations.filter(op => 
          new Date(op.date) <= endOfDay
        );
      }

      // Apply location filter
      if (locationFilter !== "all") {
        filteredOperations = filteredOperations.filter(op => 
          op.location === locationFilter
        );
      }

      // Sort by date (most recent first)
      filteredOperations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return filteredOperations;
    },
    enabled: enabled,
  });
}
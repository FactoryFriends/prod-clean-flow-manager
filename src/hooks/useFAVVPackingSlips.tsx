
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseFAVVPackingSlipsProps {
  locationFilter: "all" | "tothai" | "khin";
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

export function useFAVVPackingSlips({ 
  locationFilter, 
  startDate, 
  endDate, 
  enabled = true 
}: UseFAVVPackingSlipsProps) {
  return useQuery({
    queryKey: ["favv-packing-slips", locationFilter, startDate, endDate],
    queryFn: async () => {
      console.log("Fetching packing slips with filters:", { locationFilter, startDate, endDate });
      
      const { data, error } = await supabase
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

      if (error) {
        console.error("Error fetching packing slips:", error);
        throw error;
      }

      console.log("Raw packing slips data:", data);
      let filteredData = data || [];

      // Apply date filters
      if (startDate) {
        const beforeDateFilter = filteredData.length;
        filteredData = filteredData.filter(slip => 
          new Date(slip.created_at) >= startDate
        );
        console.log(`Date filter (start): ${beforeDateFilter} -> ${filteredData.length}`);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        const beforeDateFilter = filteredData.length;
        filteredData = filteredData.filter(slip => 
          new Date(slip.created_at) <= endOfDay
        );
        console.log(`Date filter (end): ${beforeDateFilter} -> ${filteredData.length}`);
      }

      // Apply location filter - only filter if not "all"
      if (locationFilter !== "all") {
        const beforeLocationFilter = filteredData.length;
        filteredData = filteredData.filter(slip => {
          if (slip.dispatch_records?.location) {
            return slip.dispatch_records.location === locationFilter;
          }
          // If no dispatch_records.location, assume it's from the current location
          return true;
        });
        console.log(`Location filter (${locationFilter}): ${beforeLocationFilter} -> ${filteredData.length}`);
      } else {
        console.log("Showing all packing slips:", filteredData.length);
      }

      // Fetch batch information for each packing slip
      const packingSlipsWithBatches = await Promise.all(
        filteredData.map(async (slip) => {
          if (slip.batch_ids && slip.batch_ids.length > 0) {
            try {
              console.log("Fetching batch data for slip:", slip.slip_number, "batch_ids:", slip.batch_ids);
              
              const { data: batchData, error: batchError } = await supabase
                .from("production_batches")
                .select(`
                  id,
                  batch_number,
                  production_date,
                  expiry_date,
                  products (
                    name,
                    unit_size,
                    unit_type,
                    product_type,
                    supplier_name
                  )
                `)
                .in("id", slip.batch_ids);

              if (batchError) {
                console.error("Error fetching batch data for slip:", slip.id, batchError);
                return slip;
              }

              if (batchData && batchData.length > 0) {
                console.log("Found batch data for slip:", slip.slip_number, batchData);
                return {
                  ...slip,
                  batches: batchData
                };
              } else {
                console.log("No batch data found for slip:", slip.slip_number);
                return slip;
              }
            } catch (error) {
              console.error("Error fetching batch data for slip:", slip.id, error);
              return slip;
            }
          }
          return slip;
        })
      );

      console.log("Final filtered data with batches:", packingSlipsWithBatches);
      return packingSlipsWithBatches;
    },
    enabled: enabled,
  });
}

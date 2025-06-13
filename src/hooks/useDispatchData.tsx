
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SelectedItem } from "@/types/dispatch";

interface CreateDispatchData {
  dispatchType: "external" | "internal";
  customer?: string;
  pickerCode: string;
  pickerName: string;
  dispatchNotes: string;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
}

export const useDispatchRecords = (location?: string) => {
  return useQuery({
    queryKey: ["dispatch-records", location],
    queryFn: async () => {
      let query = supabase
        .from("dispatch_records")
        .select(`
          *,
          dispatch_items (*)
        `)
        .order("created_at", { ascending: false });

      if (location) {
        query = query.eq("location", location);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateDispatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dispatchData: CreateDispatchData) => {
      const {
        dispatchType,
        customer,
        pickerCode,
        pickerName,
        dispatchNotes,
        selectedItems,
        currentLocation,
      } = dispatchData;

      // Calculate totals
      const totalItems = selectedItems.length;
      const totalPackages = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);

      // Create dispatch record
      const { data: dispatchRecord, error: dispatchError } = await supabase
        .from("dispatch_records")
        .insert({
          dispatch_type: dispatchType,
          customer: dispatchType === "external" ? customer : null,
          picker_code: pickerCode,
          picker_name: pickerName,
          dispatch_notes: dispatchNotes,
          total_items: totalItems,
          total_packages: totalPackages,
          location: currentLocation,
        })
        .select()
        .single();

      if (dispatchError) throw dispatchError;

      // Create dispatch items
      const dispatchItems = selectedItems.map(item => ({
        dispatch_id: dispatchRecord.id,
        item_id: item.id,
        item_type: item.type,
        item_name: item.name,
        batch_number: item.batchNumber || null,
        quantity: item.selectedQuantity,
        production_date: item.productionDate || null,
        expiry_date: item.expiryDate || null,
      }));

      const { error: itemsError } = await supabase
        .from("dispatch_items")
        .insert(dispatchItems);

      if (itemsError) throw itemsError;

      return dispatchRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-records"] });
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
    },
  });
};

export const useCreatePackingSlip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dispatchId,
      slipNumber,
      destination,
      preparedBy,
      pickedUpBy,
      batchIds,
      totalItems,
      totalPackages,
    }: {
      dispatchId: string;
      slipNumber: string;
      destination: string;
      preparedBy: string;
      pickedUpBy: string;
      batchIds: string[];
      totalItems: number;
      totalPackages: number;
    }) => {
      const { data, error } = await supabase
        .from("packing_slips")
        .insert({
          dispatch_id: dispatchId,
          slip_number: slipNumber,
          destination,
          prepared_by: preparedBy,
          picked_up_by: pickedUpBy,
          batch_ids: batchIds,
          total_items: totalItems,
          total_packages: totalPackages,
          pickup_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packing-slips"] });
    },
  });
};

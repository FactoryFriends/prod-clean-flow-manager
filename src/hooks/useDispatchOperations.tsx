
import { useState } from "react";
import { useCreateDispatch, useCreatePackingSlip } from "@/hooks/useDispatchData";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { SelectedItem, DispatchType } from "@/types/dispatch";

interface UseDispatchOperationsProps {
  dispatchType: DispatchType;
  customer: string;
  pickerCode: string;
  pickerName: string;
  dispatchNotes: string;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
  setCurrentDispatchId: (id: string | null) => void;
  setPackingSlipOpen: (open: boolean) => void;
  setPackingSlipStaffNames: (names: { preparedBy: string; pickedUpBy: string }) => void;
  onSuccess: () => void;
}

export function useDispatchOperations({
  dispatchType,
  customer,
  pickerCode,
  pickerName,
  dispatchNotes,
  selectedItems,
  currentLocation,
  setCurrentDispatchId,
  setPackingSlipOpen,
  setPackingSlipStaffNames,
  onSuccess
}: UseDispatchOperationsProps) {
  const { data: customers = [] } = useCustomers(true);
  const createDispatch = useCreateDispatch();
  const createPackingSlip = useCreatePackingSlip();
  const { toast } = useToast();

  const generatePackingSlipNumber = () => {
    const date = format(new Date(), "yyyyMMdd");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `PS-${date}-${random}`;
  };

  const getDestination = () => {
    const selectedCustomer = customers.find(c => c.id === customer);
    return selectedCustomer ? selectedCustomer.name : "External Customer";
  };

  const handleCreatePackingSlip = async () => {
    console.log("Creating packing slip with staff name:", pickerName);
    
    try {
      // Store staff names before any state changes
      const staffNames = {
        preparedBy: pickerName,
        pickedUpBy: pickerName
      };
      
      // First create the dispatch record
      const dispatchRecord = await createDispatch.mutateAsync({
        dispatchType,
        customer,
        pickerCode,
        pickerName,
        dispatchNotes,
        selectedItems,
        currentLocation,
      });

      // Then create the packing slip
      const batchIds = selectedItems
        .filter(item => item.type === 'batch')
        .map(item => item.id);

      const slipNumber = generatePackingSlipNumber();
      
      await createPackingSlip.mutateAsync({
        dispatchId: dispatchRecord.id,
        slipNumber,
        destination: getDestination(),
        preparedBy: pickerName,
        pickedUpBy: pickerName,
        batchIds,
        totalItems: selectedItems.length,
        totalPackages: selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0),
      });

      setCurrentDispatchId(dispatchRecord.id);
      
      // Set staff names for packing slip
      setPackingSlipStaffNames(staffNames);
      
      // Open packing slip
      setPackingSlipOpen(true);

      toast({
        title: "Dispatch Created",
        description: `External dispatch ${slipNumber} created successfully`,
      });

      // Reset form after a short delay
      setTimeout(() => {
        onSuccess();
      }, 100);

    } catch (error) {
      console.error("Error creating dispatch:", error);
      toast({
        title: "Error",
        description: "Failed to create dispatch. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInternalUse = async () => {
    try {
      await createDispatch.mutateAsync({
        dispatchType,
        customer: undefined,
        pickerCode,
        pickerName,
        dispatchNotes,
        selectedItems,
        currentLocation,
      });

      toast({
        title: "Internal Use Logged",
        description: `${selectedItems.length} items logged for internal kitchen use`,
      });

      onSuccess();

    } catch (error) {
      console.error("Error logging internal use:", error);
      toast({
        title: "Error",
        description: "Failed to log internal use. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    handleCreatePackingSlip,
    handleInternalUse
  };
}


import { useState } from "react";
import { useCreateDispatch } from "@/hooks/useCreateDispatch";
import { useCreatePackingSlip } from "@/hooks/useCreatePackingSlipMutation";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { SelectedItem } from "@/types/dispatch";

interface UsePackingSlipOperationsProps {
  customer: string;
  pickerCode: string;
  pickerName: string;
  dispatchNotes: string;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
  setCurrentDispatchId: (id: string | null) => void;
  setPackingSlipOpen: (open: boolean) => void;
  setPackingSlipStaffNames: (names: { preparedBy: string; pickedUpBy: string }) => void;
  setPackingSlipItems: (items: SelectedItem[]) => void;
  onSuccess: () => void;
}

export function usePackingSlipOperations({
  customer,
  pickerCode,
  pickerName,
  dispatchNotes,
  selectedItems,
  currentLocation,
  setCurrentDispatchId,
  setPackingSlipOpen,
  setPackingSlipStaffNames,
  setPackingSlipItems,
  onSuccess
}: UsePackingSlipOperationsProps) {
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
    console.log("Creating packing slip with selected items:", selectedItems.length);
    
    try {
      const staffNames = {
        preparedBy: pickerName,
        pickedUpBy: pickerName
      };
      
      setPackingSlipItems([...selectedItems]);
      
      const dispatchRecord = await createDispatch.mutateAsync({
        dispatchType: "external",
        customer,
        pickerCode,
        pickerName,
        dispatchNotes,
        selectedItems,
        currentLocation,
      });

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
      setPackingSlipStaffNames(staffNames);
      setPackingSlipOpen(true);

      toast({
        title: "Dispatch Created",
        description: `External dispatch ${slipNumber} created successfully`,
      });

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

  return {
    handleCreatePackingSlip
  };
}

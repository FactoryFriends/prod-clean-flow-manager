
import { usePackingSlipOperations } from "./usePackingSlipOperations";
import { useInternalDispatchOperations } from "./useInternalDispatchOperations";
import { SelectedItem, DispatchType } from "@/types/dispatch";

interface UseDispatchOperationsProps {
  dispatchType: DispatchType;
  customer: string;
  pickerName: string;
  dispatchNotes: string;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
  setCurrentDispatchId: (id: string | null) => void;
  setPackingSlipOpen: (open: boolean) => void;
  setPackingSlipStaffNames: (names: { preparedBy: string; pickedUpBy: string }) => void;
  setPackingSlipItems: (items: SelectedItem[]) => void;
  setPackingSlipId: (id: string | null) => void;
  setPackingSlipNumber: (number: string | null) => void;
  onSuccess: (dispatchId?: string) => void;
}

export function useDispatchOperations({
  dispatchType,
  customer,
  pickerName,
  dispatchNotes,
  selectedItems,
  currentLocation,
  setCurrentDispatchId,
  setPackingSlipOpen,
  setPackingSlipStaffNames,
  setPackingSlipItems,
  setPackingSlipId,
  setPackingSlipNumber,
  onSuccess
}: UseDispatchOperationsProps) {
  const { handleCreatePackingSlip } = usePackingSlipOperations({
    customer,
    pickerName,
    dispatchNotes,
    selectedItems,
    currentLocation,
    setCurrentDispatchId,
    setPackingSlipOpen,
    setPackingSlipStaffNames,
    setPackingSlipItems,
    setPackingSlipId,
    setPackingSlipNumber,
    onSuccess
  });

  const { handleInternalUse } = useInternalDispatchOperations({
    pickerName,
    selectedItems,
    currentLocation,
    onSuccess: (dispatchId: string) => onSuccess(dispatchId)
  });

  return {
    handleCreatePackingSlip,
    handleInternalUse
  };
}

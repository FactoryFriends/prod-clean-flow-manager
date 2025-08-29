
import { Button } from "../ui/button";
import { usePackingSlipActions } from "@/hooks/usePackingSlipActions";
import { useState } from "react";
import { SelectedItem } from "@/types/dispatch";

interface Customer {
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
}

interface PackingSlipActionsProps {
  packingSlipNumber: string;
  currentDate: string;
  destinationCustomer: Customer | null;
  selectedItems: SelectedItem[];
  totalItems: number;
  totalPackages: number;
  preparedBy: string;
  pickedUpBy: string;
  dispatchId?: string;
  packingSlipId?: string;
  onClose: () => void;
}

export function PackingSlipActions({
  packingSlipNumber,
  currentDate,
  destinationCustomer,
  selectedItems,
  totalItems,
  totalPackages,
  preparedBy,
  pickedUpBy,
  dispatchId,
  packingSlipId,
  onClose,
}: PackingSlipActionsProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const { handleDownloadPDF, handleCopyDetails, handleConfirmAndShip } = usePackingSlipActions({
    packingSlipNumber,
    currentDate,
    destinationCustomer,
    selectedItems,
    totalItems,
    totalPackages,
    preparedBy,
    pickedUpBy,
    dispatchId,
    packingSlipId,
  });

  const handleConfirm = async () => {
    setIsConfirming(true);
    const success = await handleConfirmAndShip();
    if (success) {
      onClose();
    }
    setIsConfirming(false);
  };

  return (
    <div className="flex justify-end items-center mt-6 gap-2">
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
      <Button 
        onClick={handleConfirm}
        disabled={isConfirming}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
        size="lg"
      >
        {isConfirming ? "Confirming..." : "CONFIRM & SHIP"}
      </Button>
    </div>
  );
}

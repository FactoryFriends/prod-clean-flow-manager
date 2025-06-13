
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
    <div className="flex justify-between items-center mt-6">
      <Button 
        onClick={handleConfirm}
        disabled={isConfirming}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
        size="lg"
      >
        {isConfirming ? "Confirming..." : "CONFIRM & SHIP"}
      </Button>
      
      <div className="flex gap-2">
        <Button 
          onClick={handleDownloadPDF}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          Download PDF
        </Button>
        <Button 
          variant="outline"
          onClick={handleCopyDetails}
        >
          Copy Details
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

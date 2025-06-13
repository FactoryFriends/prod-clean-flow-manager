
import { useState, useEffect } from "react";
import { useProductionBatches } from "@/hooks/useProductionData";
import { useCustomers } from "@/hooks/useCustomers";
import { PackingSlipDialog } from "../PackingSlipDialog";
import { DispatchHeader } from "./DispatchHeader";
import { DispatchForm } from "./DispatchForm";
import { SelectedItemsSummary } from "./SelectedItemsSummary";
import { InventoryGrid } from "./InventoryGrid";
import { SelectedItem, DispatchType } from "@/types/dispatch";
import { externalProducts } from "@/data/dispatchData";
import { useDispatchOperations } from "@/hooks/useDispatchOperations";

interface DispatchManagerProps {
  currentLocation: "tothai" | "khin";
}

export function DispatchManager({ currentLocation }: DispatchManagerProps) {
  const [dispatchType, setDispatchType] = useState<DispatchType>("external");
  const [customer, setCustomer] = useState("");
  const [pickerCode, setPickerCode] = useState("");
  const [pickerName, setPickerName] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [packingSlipOpen, setPackingSlipOpen] = useState(false);
  const [currentDispatchId, setCurrentDispatchId] = useState<string | null>(null);
  const [packingSlipStaffNames, setPackingSlipStaffNames] = useState<{
    preparedBy: string;
    pickedUpBy: string;
  }>({ preparedBy: "", pickedUpBy: "" });
  const [packingSlipItems, setPackingSlipItems] = useState<SelectedItem[]>([]);

  const { data: batches } = useProductionBatches(currentLocation);
  const { data: customers = [] } = useCustomers(true);
  
  const { handleCreatePackingSlip, handleInternalUse } = useDispatchOperations({
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
    setPackingSlipItems,
    onSuccess: () => {
      setSelectedItems([]);
      setPickerCode("");
      setPickerName("");
      setDispatchNotes("");
      if (dispatchType === "internal") {
        setCustomer("");
      }
    }
  });

  // Reset customer when switching dispatch types
  useEffect(() => {
    if (dispatchType === "internal") {
      setCustomer("");
    }
  }, [dispatchType]);

  // Convert batches to available inventory
  const availableBatches = (batches || []).map(batch => ({
    id: batch.id,
    type: 'batch' as const,
    name: batch.products.name,
    batchNumber: batch.batch_number,
    availableQuantity: batch.packages_produced,
    selectedQuantity: 0,
    expiryDate: batch.expiry_date,
    productionDate: batch.production_date,
  }));

  const availableExternal = externalProducts.map(product => ({
    id: product.id,
    type: 'external' as const,
    name: product.name,
    selectedQuantity: 0,
  }));

  const allAvailableItems = [...availableBatches, ...availableExternal];

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = allAvailableItems.find(i => i.id === itemId);
    if (!item) return;

    const existingIndex = selectedItems.findIndex(si => si.id === itemId);
    
    if (existingIndex >= 0) {
      const maxQuantity = item.type === 'batch' && item.availableQuantity ? item.availableQuantity : 999;
      const newQuantity = Math.max(0, Math.min(maxQuantity, selectedItems[existingIndex].selectedQuantity + change));
      
      if (newQuantity === 0) {
        setSelectedItems(prev => prev.filter(si => si.id !== itemId));
      } else {
        setSelectedItems(prev => prev.map(si => 
          si.id === itemId ? { ...si, selectedQuantity: newQuantity } : si
        ));
      }
    } else if (change > 0) {
      setSelectedItems(prev => [...prev, { ...item, selectedQuantity: 1 }]);
    }

    console.log("Selected items updated:", selectedItems.length + (change > 0 && existingIndex < 0 ? 1 : 0));
  };

  console.log("DispatchManager render:", {
    selectedItemsCount: selectedItems.length,
    packingSlipItemsCount: packingSlipItems.length,
    pickerCode,
    pickerName,
    customer,
    dispatchType
  });

  return (
    <div className="space-y-6">
      <DispatchHeader 
        dispatchType={dispatchType}
        onDispatchTypeChange={setDispatchType}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DispatchForm
          dispatchType={dispatchType}
          customer={customer}
          setCustomer={setCustomer}
          pickerCode={pickerCode}
          setPickerCode={setPickerCode}
          pickerName={pickerName}
          setPickerName={setPickerName}
          dispatchNotes={dispatchNotes}
          setDispatchNotes={setDispatchNotes}
          selectedItems={selectedItems}
          onCreatePackingSlip={handleCreatePackingSlip}
          onInternalUse={handleInternalUse}
        />

        <SelectedItemsSummary
          selectedItems={selectedItems}
          onQuantityChange={handleQuantityChange}
        />
      </div>

      <InventoryGrid
        currentLocation={currentLocation}
        selectedItems={selectedItems}
        onQuantityChange={handleQuantityChange}
      />

      {dispatchType === "external" && (
        <PackingSlipDialog
          open={packingSlipOpen}
          onOpenChange={setPackingSlipOpen}
          selectedItems={packingSlipItems}
          customer={customer}
          preparedBy={packingSlipStaffNames.preparedBy}
          pickedUpBy={packingSlipStaffNames.pickedUpBy}
          dispatchNotes={dispatchNotes}
          currentLocation={currentLocation}
        />
      )}
    </div>
  );
}

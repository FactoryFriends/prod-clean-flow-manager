
import { useState } from "react";
import { useProductionBatches } from "@/hooks/useProductionData";
import { PackingSlipDialog } from "./PackingSlipDialog";
import { DispatchHeader } from "./dispatch/DispatchHeader";
import { DispatchForm } from "./dispatch/DispatchForm";
import { SelectedItemsSummary } from "./dispatch/SelectedItemsSummary";
import { InventoryGrid } from "./dispatch/InventoryGrid";
import { SelectedItem, DispatchType } from "@/types/dispatch";
import { externalProducts } from "@/data/dispatchData";

interface DispatchProps {
  currentLocation: "tothai" | "khin";
}

export function Dispatch({ currentLocation }: DispatchProps) {
  const [dispatchType, setDispatchType] = useState<DispatchType>("external");
  const [customer, setCustomer] = useState("");
  const [pickerCode, setPickerCode] = useState("");
  const [pickerName, setPickerName] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [packingSlipOpen, setPackingSlipOpen] = useState(false);

  const { data: batches } = useProductionBatches(currentLocation);

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
  };

  const handleCreatePackingSlip = () => {
    setPackingSlipOpen(true);
  };

  const handleInternalUse = () => {
    console.log("Processing internal use for:", selectedItems);
    alert(`Internal use registered: ${selectedItems.length} items logged for kitchen use`);
    // Reset the form
    setSelectedItems([]);
    setPickerCode("");
    setPickerName("");
    setDispatchNotes("");
  };

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
          selectedItems={selectedItems}
          customer={customer}
          preparedBy={pickerName}
          pickedUpBy={pickerName}
          dispatchNotes={dispatchNotes}
          currentLocation={currentLocation}
        />
      )}
    </div>
  );
}

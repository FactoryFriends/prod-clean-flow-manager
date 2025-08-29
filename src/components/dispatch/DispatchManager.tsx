
import { useState, useEffect } from "react";
import { useProductionBatches } from "@/hooks/useProductionData";
import { useCustomers } from "@/hooks/useCustomers";
import { PackingSlipDialog } from "../PackingSlipDialog";
import { DispatchFormHeader } from "./DispatchFormHeader";
import { LivePackingList } from "./LivePackingList";
import { InventoryBrowser } from "./InventoryBrowser";
import { SelectedItem, DispatchType } from "@/types/dispatch";
import { externalProducts } from "@/data/dispatchData";
import { useDispatchOperations } from "@/hooks/useDispatchOperations";

interface DispatchManagerProps {
  currentLocation: "tothai" | "khin";
  dispatchType: DispatchType;
}

export function DispatchManager({ currentLocation, dispatchType }: DispatchManagerProps) {
  const [customer, setCustomer] = useState("");
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
    pickerName,
    customer,
    dispatchType
  });

  return (
    <div className="space-y-6">
      {/* Compact Form Header */}
      <DispatchFormHeader
        dispatchType={dispatchType}
        customer={customer}
        setCustomer={setCustomer}
        pickerName={pickerName}
        setPickerName={setPickerName}
        dispatchNotes={dispatchNotes}
        setDispatchNotes={setDispatchNotes}
        selectedItems={selectedItems}
        onCreatePackingSlip={handleCreatePackingSlip}
        onInternalUse={handleInternalUse}
      />

      {/* Side-by-Side Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ height: '70vh' }}>
        {/* Left Panel - Inventory Browser */}
        <InventoryBrowser
          currentLocation={currentLocation}
          selectedItems={selectedItems}
          onAddToPackingList={handleQuantityChange}
        />

        {/* Right Panel - Live Packing List */}
        <LivePackingList
          selectedItems={selectedItems}
          onQuantityChange={handleQuantityChange}
        />
      </div>

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
          dispatchId={currentDispatchId}
        />
      )}
    </div>
  );
}

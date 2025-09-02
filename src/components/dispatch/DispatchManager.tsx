
import { useState, useEffect } from "react";
import { useProductionBatches, useExternalProducts, useIngredientProducts } from "@/hooks/useProductionData";
import { useCustomers } from "@/hooks/useCustomers";
import { PackingSlipDialog } from "../PackingSlipDialog";
import { DispatchFormHeader } from "./DispatchFormHeader";
import { LivePackingList } from "./LivePackingList";
import { InventoryBrowser } from "./InventoryBrowser";
import { InternalDispatchSummary } from "./InternalDispatchSummary";
import { SelectedItem, DispatchType } from "@/types/dispatch";
import { useDispatchOperations } from "@/hooks/useDispatchOperations";

interface DispatchManagerProps {
  currentLocation: "tothai" | "khin";
  dispatchType: DispatchType;
}

export function DispatchManager({ currentLocation, dispatchType }: DispatchManagerProps) {
  const [customer, setCustomer] = useState("");
  const [pickerName, setPickerName] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [packingSlipOpen, setPackingSlipOpen] = useState(false);
  const [currentDispatchId, setCurrentDispatchId] = useState<string | null>(null);
  const [packingSlipStaffNames, setPackingSlipStaffNames] = useState<{
    preparedBy: string;
    pickedUpBy: string;
  }>({ preparedBy: "", pickedUpBy: "" });
  const [packingSlipItems, setPackingSlipItems] = useState<SelectedItem[]>([]);
  const [packingSlipId, setPackingSlipId] = useState<string | null>(null);
  const [packingSlipNumber, setPackingSlipNumber] = useState<string | null>(null);
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);
  const [summaryDispatchId, setSummaryDispatchId] = useState<string | null>(null);
  const [summaryItems, setSummaryItems] = useState<SelectedItem[]>([]);
  const [summaryPickerName, setSummaryPickerName] = useState("");

  const { data: batches } = useProductionBatches(currentLocation);
  const { data: customers = [] } = useCustomers(true);
  const { data: externalProducts } = useExternalProducts();
  const { data: ingredientProducts } = useIngredientProducts();
  
  const { handleCreatePackingSlip, handleInternalUse } = useDispatchOperations({
    dispatchType,
    customer,
    pickerName,
    dispatchNotes: "",
    selectedItems,
    currentLocation,
    setCurrentDispatchId,
    setPackingSlipOpen,
    setPackingSlipStaffNames,
    setPackingSlipItems,
    setPackingSlipId,
    setPackingSlipNumber,
    onSuccess: (dispatchId?: string) => {
      if (dispatchType === "internal" && dispatchId) {
        // For internal dispatches, show summary screen instead of clearing immediately
        setSummaryDispatchId(dispatchId);
        setSummaryItems([...selectedItems]);
        setSummaryPickerName(pickerName);
        setShowSummaryScreen(true);
      } else {
        // For external dispatches, clear as before
        setSelectedItems([]);
        setPickerName("");
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

  // Match InventoryBrowser data structure exactly
  const availableExternalProducts = (externalProducts || []).map(product => ({
    id: product.id,
    type: 'external' as const,
    name: product.name,
    selectedQuantity: 0,
    supplier: product.supplier_name,
    productType: 'External Product' as const,
    innerUnitType: product.inner_unit_type,
  }));

  const availableIngredientProducts = (ingredientProducts || []).map(product => ({
    id: product.id,
    type: 'ingredient' as const,
    name: product.name,
    selectedQuantity: 0,
    supplier: product.supplier_name,
    productType: 'Ingredient' as const,
    innerUnitType: product.inner_unit_type,
  }));

  const allAvailableItems = [...availableBatches, ...availableExternalProducts, ...availableIngredientProducts];

  const handleQuantityChange = (itemId: string, change: number) => {
    console.log('🔍 handleQuantityChange called:', { itemId, change });
    console.log('📦 allAvailableItems count:', allAvailableItems.length);
    console.log('🏪 External products:', availableExternalProducts.length);
    console.log('🥘 Ingredient products:', availableIngredientProducts.length);
    console.log('🔧 Looking for item:', itemId);
    
    const item = allAvailableItems.find(i => i.id === itemId);
    if (!item) {
      console.error('❌ Item not found:', itemId);
      console.error('Available item IDs:', allAvailableItems.map(i => ({ id: i.id, name: i.name, type: i.type })));
      return;
    }
    console.log('✅ Found item:', item);

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

  const handleSummaryConfirm = () => {
    setShowSummaryScreen(false);
    setSummaryDispatchId(null);
    setSummaryItems([]);
    setSummaryPickerName("");
    setSelectedItems([]);
    setPickerName("");
    setCustomer("");
  };

  const handleSummaryCancel = () => {
    setShowSummaryScreen(false);
    setSummaryDispatchId(null);
    setSummaryItems([]);
    setSummaryPickerName("");
    // Keep selectedItems and pickerName so user can continue where they left off
  };

  console.log("🚀 DispatchManager render:", {
    selectedItemsCount: selectedItems.length,
    packingSlipItemsCount: packingSlipItems.length,
    pickerName,
    customer,
    dispatchType,
    showSummaryScreen,
    externalProductsCount: (externalProducts || []).length,
    ingredientProductsCount: (ingredientProducts || []).length,
    allAvailableItemsCount: allAvailableItems.length
  });

  // Show summary screen for internal dispatches after CREATE PICK
  if (dispatchType === "internal" && showSummaryScreen && summaryDispatchId) {
    return (
      <InternalDispatchSummary
        selectedItems={summaryItems}
        pickerName={summaryPickerName}
        currentLocation={currentLocation}
        dispatchId={summaryDispatchId}
        onConfirm={handleSummaryConfirm}
        onCancel={handleSummaryCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Form Header */}
        <DispatchFormHeader
          dispatchType={dispatchType}
          customer={customer}
          setCustomer={setCustomer}
          pickerName={pickerName}
          setPickerName={setPickerName}
          selectedItems={selectedItems}
          currentLocation={currentLocation}
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
          pickerName={pickerName}
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
          dispatchNotes=""
          currentLocation={currentLocation}
          dispatchId={currentDispatchId}
          packingSlipId={packingSlipId}
          packingSlipNumber={packingSlipNumber}
        />
      )}
    </div>
  );
}

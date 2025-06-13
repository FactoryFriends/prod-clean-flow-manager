import { useState } from "react";
import { useProductionBatches } from "@/hooks/useProductionData";
import { useCreateDispatch, useCreatePackingSlip } from "@/hooks/useDispatchData";
import { useCustomers } from "@/hooks/useCustomers";
import { PackingSlipDialog } from "./PackingSlipDialog";
import { DispatchHeader } from "./dispatch/DispatchHeader";
import { DispatchForm } from "./dispatch/DispatchForm";
import { SelectedItemsSummary } from "./dispatch/SelectedItemsSummary";
import { InventoryGrid } from "./dispatch/InventoryGrid";
import { SelectedItem, DispatchType } from "@/types/dispatch";
import { externalProducts } from "@/data/dispatchData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  const [currentDispatchId, setCurrentDispatchId] = useState<string | null>(null);

  const { data: batches } = useProductionBatches(currentLocation);
  const { data: customers = [] } = useCustomers(true);
  const createDispatch = useCreateDispatch();
  const createPackingSlip = useCreatePackingSlip();
  const { toast } = useToast();

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
    try {
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
      setPackingSlipOpen(true);

      toast({
        title: "Dispatch Created",
        description: `External dispatch ${slipNumber} created successfully`,
      });

      // Reset form
      setSelectedItems([]);
      setPickerCode("");
      setPickerName("");
      setDispatchNotes("");
      setCustomer("");

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

      // Reset form
      setSelectedItems([]);
      setPickerCode("");
      setPickerName("");
      setDispatchNotes("");

    } catch (error) {
      console.error("Error logging internal use:", error);
      toast({
        title: "Error",
        description: "Failed to log internal use. Please try again.",
        variant: "destructive",
      });
    }
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

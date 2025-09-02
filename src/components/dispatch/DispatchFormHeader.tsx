import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DispatchType, SelectedItem } from "@/types/dispatch";
import { useCustomers } from "@/hooks/useCustomers";
import { useStaffCodes } from "@/hooks/useStaffCodes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useInternalDispatchRecords } from "@/hooks/useInternalDispatchRecords";
import { useConfirmInternalDispatch } from "@/hooks/useConfirmInternalDispatch";
import { InternalDispatchConfirmationDialog } from "./InternalDispatchConfirmationDialog";
import { CheckCircle } from "lucide-react";

interface DispatchFormHeaderProps {
  dispatchType: DispatchType;
  customer: string;
  setCustomer: (customer: string) => void;
  pickerName: string;
  setPickerName: (name: string) => void;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
  onCreatePackingSlip: () => void;
  onInternalUse: () => Promise<string | void>;
}

export function DispatchFormHeader({
  dispatchType,
  customer,
  setCustomer,
  pickerName,
  setPickerName,
  selectedItems,
  currentLocation,
  onCreatePackingSlip,
  onInternalUse,
}: DispatchFormHeaderProps) {
  const [showInternalConfirmation, setShowInternalConfirmation] = useState(false);
  const [justCreatedDispatchId, setJustCreatedDispatchId] = useState<string | null>(null);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useCustomers(true);
  const { data: staffCodes = [] } = useStaffCodes();
  const { data: pendingInternalDispatches = [] } = useInternalDispatchRecords(currentLocation);
  const confirmDispatch = useConfirmInternalDispatch();
  const isMobile = useIsMobile();

  // Set KHIN as default customer for external dispatch
  useEffect(() => {
    if (dispatchType === "external" && !customer && customers.length > 0) {
      const khinCustomer = customers.find(c => 
        c.name.toLowerCase().includes('khin') || c.name.toLowerCase().includes('restaurant')
      );
      if (khinCustomer) {
        setCustomer(khinCustomer.id);
      } else {
        setCustomer(customers[0].id);
      }
    }
  }, [dispatchType, customers, customer, setCustomer]);

  const canSubmit = pickerName && selectedItems.length > 0 && 
    (dispatchType === "internal" || (dispatchType === "external" && customer));

  const totalItems = selectedItems.reduce((sum, item) => sum + item.selectedQuantity, 0);

  // Handle progressive internal dispatch workflow
  const handleInternalAction = async () => {
    if (!isAwaitingConfirmation) {
      // First click: Create dispatch
      try {
        const dispatchId = await onInternalUse();
        if (dispatchId && typeof dispatchId === 'string') {
          setJustCreatedDispatchId(dispatchId);
          setIsAwaitingConfirmation(true);
        }
      } catch (error) {
        console.error("Error creating internal pick:", error);
      }
    } else {
      // Second click: Confirm dispatch
      if (justCreatedDispatchId) {
        try {
          await confirmDispatch.mutateAsync({
            dispatchId: justCreatedDispatchId,
            confirmedBy: pickerName,
          });
          // Reset state after successful confirmation
          setJustCreatedDispatchId(null);
          setIsAwaitingConfirmation(false);
        } catch (error) {
          console.error("Error confirming dispatch:", error);
        }
      }
    }
  };

  // Handle cancel pickup - resets to initial state
  const handleCancelPickup = () => {
    setJustCreatedDispatchId(null);
    setIsAwaitingConfirmation(false);
  };

  // Reset state when dispatch type or selected items change
  useEffect(() => {
    if (dispatchType !== "internal" || selectedItems.length === 0) {
      setJustCreatedDispatchId(null);
      setIsAwaitingConfirmation(false);
    }
  }, [dispatchType, selectedItems.length]);

  // Determine button appearance and state
  const getButtonConfig = () => {
    if (!isAwaitingConfirmation) {
      return {
        text: `CREATE PICK (${totalItems})`,
        className: "flex-1 h-9 bg-orange-500 hover:bg-orange-600 text-white",
        disabled: !canSubmit,
        icon: null
      };
    } else {
      return {
        text: `CONFIRM PICKUP (${totalItems})`,
        className: "flex-1 h-9 bg-green-600 hover:bg-green-700 text-white",
        disabled: confirmDispatch.isPending,
        icon: <CheckCircle className="w-4 h-4" />
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Staff Selection - Wider field */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="picker-name" className="text-sm">Staff</Label>
            <Select value={pickerName} onValueChange={setPickerName}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staffCodes.map((staff) => (
                  <SelectItem key={staff.code} value={staff.name}>
                    <div className="flex items-center gap-2">
                      <span>{staff.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({staff.role || 'Staff'})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Selection (only for external) */}
          {dispatchType === "external" && (
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-sm">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customerRecord) => (
                    <SelectItem key={customerRecord.id} value={customerRecord.id}>
                      <div className="flex items-center gap-2">
                        <span>{customerRecord.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({customerRecord.customer_type})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Label className="text-sm opacity-0">Actions</Label>
            {dispatchType === "external" ? (
              <Button 
                onClick={onCreatePackingSlip}
                disabled={!canSubmit}
                className="w-full h-9 bg-primary hover:bg-primary/90"
              >
                REVIEW & SHIP ({totalItems})
              </Button>
            ) : (
              <div className="flex gap-2 justify-end">
                {isAwaitingConfirmation ? (
                  <>
                    <Button 
                      onClick={handleInternalAction}
                      disabled={buttonConfig.disabled}
                      className={buttonConfig.className.replace('flex-1', '')}
                    >
                      {buttonConfig.icon}
                      {buttonConfig.text}
                    </Button>
                    <Button 
                      onClick={handleCancelPickup}
                      variant="outline"
                      className="h-9 px-4 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      CANCEL PICKUP
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleInternalAction}
                    disabled={buttonConfig.disabled}
                    className={buttonConfig.className.replace('flex-1', '')}
                  >
                    {buttonConfig.icon}
                    {buttonConfig.text}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {dispatchType === "internal" && (
        <InternalDispatchConfirmationDialog
          open={showInternalConfirmation}
          onOpenChange={setShowInternalConfirmation}
          currentLocation={currentLocation}
        />
      )}
    </Card>
  );
}
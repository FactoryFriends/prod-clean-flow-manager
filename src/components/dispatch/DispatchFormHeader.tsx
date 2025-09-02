import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DispatchType, SelectedItem } from "@/types/dispatch";
import { useCustomers } from "@/hooks/useCustomers";
import { useStaffCodes } from "@/hooks/useStaffCodes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useInternalDispatchRecords } from "@/hooks/useInternalDispatchRecords";
import { InternalDispatchConfirmationDialog } from "./InternalDispatchConfirmationDialog";

interface DispatchFormHeaderProps {
  dispatchType: DispatchType;
  customer: string;
  setCustomer: (customer: string) => void;
  pickerName: string;
  setPickerName: (name: string) => void;
  dispatchNotes: string;
  setDispatchNotes: (notes: string) => void;
  selectedItems: SelectedItem[];
  currentLocation: "tothai" | "khin";
  onCreatePackingSlip: () => void;
  onInternalUse: () => void;
}

export function DispatchFormHeader({
  dispatchType,
  customer,
  setCustomer,
  pickerName,
  setPickerName,
  dispatchNotes,
  setDispatchNotes,
  selectedItems,
  currentLocation,
  onCreatePackingSlip,
  onInternalUse,
}: DispatchFormHeaderProps) {
  const [showInternalConfirmation, setShowInternalConfirmation] = useState(false);
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useCustomers(true);
  const { data: staffCodes = [] } = useStaffCodes();
  const { data: pendingInternalDispatches = [] } = useInternalDispatchRecords(currentLocation);
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

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Staff Selection */}
          <div className="space-y-2">
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="dispatch-notes" className="text-sm">Notes</Label>
            <Input
              id="dispatch-notes"
              placeholder="Add notes..."
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="h-9"
            />
          </div>

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
              <div className="flex gap-2">
                <Button 
                  onClick={onInternalUse}
                  disabled={!canSubmit}
                  className="flex-1 h-9 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  CREATE PICK ({totalItems})
                </Button>
                {pendingInternalDispatches.length > 0 && (
                  <Button 
                    onClick={() => setShowInternalConfirmation(true)}
                    variant="outline"
                    className="h-9 px-3 border-warning text-warning hover:bg-warning/10"
                    title={`${pendingInternalDispatches.length} pending pickup${pendingInternalDispatches.length > 1 ? 's' : ''}`}
                  >
                    {pendingInternalDispatches.length}
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
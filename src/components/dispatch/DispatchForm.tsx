
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DispatchType, SelectedItem } from "@/types/dispatch";
import { useCustomers } from "@/hooks/useCustomers";
import { useStaffCodes } from "@/hooks/useStaffCodes";
import { useEffect } from "react";

interface DispatchFormProps {
  dispatchType: DispatchType;
  customer: string;
  setCustomer: (customer: string) => void;
  pickerCode: string;
  setPickerCode: (code: string) => void;
  pickerName: string;
  setPickerName: (name: string) => void;
  dispatchNotes: string;
  setDispatchNotes: (notes: string) => void;
  selectedItems: SelectedItem[];
  onCreatePackingSlip: () => void;
  onInternalUse: () => void;
}

export function DispatchForm({
  dispatchType,
  customer,
  setCustomer,
  pickerCode,
  setPickerCode,
  pickerName,
  setPickerName,
  dispatchNotes,
  setDispatchNotes,
  selectedItems,
  onCreatePackingSlip,
  onInternalUse,
}: DispatchFormProps) {
  const { data: customers = [], isLoading: customersLoading, error: customersError } = useCustomers(true);
  const { data: staffCodes = [] } = useStaffCodes();

  // Debug logging
  console.log("DispatchForm customers debug:", {
    customers,
    customersLoading,
    customersError,
    customersLength: customers.length
  });

  // Set KHIN as default customer for external dispatch
  useEffect(() => {
    if (dispatchType === "external" && !customer && customers.length > 0) {
      console.log("Looking for KHIN customer in:", customers);
      const khinCustomer = customers.find(c => 
        c.name.toLowerCase().includes('khin') || c.name.toLowerCase().includes('restaurant')
      );
      console.log("Found KHIN customer:", khinCustomer);
      if (khinCustomer) {
        setCustomer(khinCustomer.id);
        console.log("Set customer to:", khinCustomer.id);
      } else {
        // If no KHIN found, set the first customer as default
        setCustomer(customers[0].id);
        console.log("Set first customer as default:", customers[0].id);
      }
    }
  }, [dispatchType, customers, customer, setCustomer]);

  // Auto-fill name when PIN code is entered
  useEffect(() => {
    if (pickerCode && staffCodes.length > 0) {
      const staff = staffCodes.find(s => s.code === pickerCode);
      if (staff) {
        setPickerName(staff.name);
      } else {
        setPickerName("");
      }
    }
  }, [pickerCode, staffCodes, setPickerName]);

  const canSubmit = pickerCode && pickerName && selectedItems.length > 0 && 
    (dispatchType === "internal" || (dispatchType === "external" && customer));

  console.log("DispatchForm debug:", {
    pickerCode,
    pickerName,
    selectedItemsLength: selectedItems.length,
    dispatchType,
    customer,
    canSubmit,
    customersCount: customers.length,
    customersLoading,
    customersError
  });

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="picker-code">PIN Code</Label>
              <Input
                id="picker-code"
                placeholder="Enter 4-digit PIN"
                value={pickerCode}
                onChange={(e) => setPickerCode(e.target.value)}
                maxLength={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="picker-name">Staff Name</Label>
              <Input
                id="picker-name"
                placeholder="Auto-filled from PIN"
                value={pickerName}
                onChange={(e) => setPickerName(e.target.value)}
                disabled={!!pickerCode}
              />
            </div>
          </div>

          {dispatchType === "external" && (
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger>
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
              {customersLoading && (
                <p className="text-sm text-muted-foreground">Loading customers...</p>
              )}
              {customersError && (
                <p className="text-sm text-red-500">Error loading customers: {customersError.message}</p>
              )}
              {!customersLoading && !customersError && customers.length === 0 && (
                <p className="text-sm text-orange-500">No customers found. Please add customers in Settings.</p>
              )}
              {customers.length > 0 && (
                <p className="text-sm text-green-600">Found {customers.length} customers</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dispatch-notes">Notes</Label>
            <Textarea
              id="dispatch-notes"
              placeholder="Add any dispatch notes..."
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-4">
          {dispatchType === "external" ? (
            <Button 
              onClick={onCreatePackingSlip}
              disabled={!canSubmit}
              className="flex-1"
            >
              Create Packing Slip ({selectedItems.length} items)
            </Button>
          ) : (
            <Button 
              onClick={onInternalUse}
              disabled={!canSubmit}
              className="flex-1"
            >
              Log Internal Use ({selectedItems.length} items)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

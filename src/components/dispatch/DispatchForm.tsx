
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DispatchType, SelectedItem } from "@/types/dispatch";
import { useCustomers } from "@/hooks/useCustomers";
import { useStaffCodes } from "@/hooks/useStaffCodes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

interface DispatchFormProps {
  dispatchType: DispatchType;
  customer: string;
  setCustomer: (customer: string) => void;
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
  const isMobile = useIsMobile();

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

  const canSubmit = pickerName && selectedItems.length > 0 && 
    (dispatchType === "internal" || (dispatchType === "external" && customer));

  console.log("DispatchForm debug:", {
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="picker-name">{isMobile ? "Staff" : "Staff Name"}</Label>
            <Select value={pickerName} onValueChange={setPickerName}>
              <SelectTrigger>
                <SelectValue placeholder={isMobile ? "Select staff" : "Select staff member"} />
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

          {dispatchType === "external" && (
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder={isMobile ? "Customer" : "Select customer"} />
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
                <p className="text-sm text-muted-foreground">{isMobile ? "Loading..." : "Loading customers..."}</p>
              )}
              {customersError && (
                <p className="text-sm text-red-500">{isMobile ? "Error loading" : `Error loading customers: ${customersError.message}`}</p>
              )}
              {!customersLoading && !customersError && customers.length === 0 && (
                <p className="text-sm text-orange-500">{isMobile ? "No customers" : "No customers found. Please add customers in Settings."}</p>
              )}
              {customers.length > 0 && (
                <p className="text-sm text-green-600">{isMobile ? `${customers.length} customers` : `Found ${customers.length} customers`}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dispatch-notes">Notes</Label>
            <Textarea
              id="dispatch-notes"
              placeholder={isMobile ? "Notes..." : "Add any dispatch notes..."}
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isMobile ? `Slip (${selectedItems.length})` : `Create Packing Slip (${selectedItems.length} items)`}
            </Button>
          ) : (
            <Button 
              onClick={onInternalUse}
              disabled={!canSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isMobile ? `Log (${selectedItems.length})` : `Log Internal Use (${selectedItems.length} items)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

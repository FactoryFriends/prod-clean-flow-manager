
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DispatchType, SelectedItem } from "@/types/dispatch";
import { useCustomers } from "@/hooks/useCustomers";

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
  const { data: customers = [] } = useCustomers(true); // Only active customers

  const canSubmit = pickerCode && pickerName && selectedItems.length > 0 && 
    (dispatchType === "internal" || customer);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="picker-code">Staff Code</Label>
            <Input
              id="picker-code"
              placeholder="Enter staff code"
              value={pickerCode}
              onChange={(e) => setPickerCode(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="picker-name">Staff Name</Label>
            <Input
              id="picker-name"
              placeholder="Enter staff name"
              value={pickerName}
              onChange={(e) => setPickerName(e.target.value)}
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
  );
}


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Home } from "lucide-react";
import { DispatchType, SelectedItem } from "@/types/dispatch";
import { useStaffCodes } from "@/hooks/useStaffCodes";

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
  const { data: staffCodes } = useStaffCodes();

  const handlePickerCodeChange = (value: string) => {
    setPickerCode(value);
    if (value.length === 4) {
      const staff = staffCodes?.find(s => s.code === value);
      if (staff) {
        setPickerName(staff.name);
      } else {
        setPickerName("");
      }
    } else {
      setPickerName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {dispatchType === "external" ? "Dispatch Details" : "Internal Use Details"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dispatchType === "external" && (
          <div>
            <label className="block text-sm font-medium mb-2">Customer</label>
            <Select value={customer} onValueChange={setCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="khin-restaurant">KHIN Takeaway</SelectItem>
                <SelectItem value="tothai-restaurant">To Thai Restaurant</SelectItem>
                <SelectItem value="external-customer">External Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            {dispatchType === "external" ? "Picker Code (4 digits)" : "Staff Code (4 digits)"}
          </label>
          <Input
            type="text"
            placeholder="Enter 4-digit code"
            value={pickerCode}
            onChange={(e) => handlePickerCodeChange(e.target.value)}
            maxLength={4}
            className="font-mono"
          />
          {pickerName && (
            <p className="text-sm text-green-600 mt-1">
              {dispatchType === "external" ? "Picker" : "Staff"}: {pickerName}
            </p>
          )}
          {pickerCode.length === 4 && !pickerName && (
            <p className="text-sm text-red-600 mt-1">
              Invalid code
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {dispatchType === "external" ? "Dispatch Notes" : "Usage Notes"}
          </label>
          <Textarea
            placeholder={
              dispatchType === "external" 
                ? "Special delivery instructions, temperature requirements, etc..."
                : "Purpose of use, recipe requirements, etc..."
            }
            value={dispatchNotes}
            onChange={(e) => setDispatchNotes(e.target.value)}
            rows={3}
          />
        </div>

        {dispatchType === "external" ? (
          <Button 
            onClick={onCreatePackingSlip}
            disabled={selectedItems.length === 0 || !customer || !pickerName}
            className="w-full"
          >
            <Package className="w-4 h-4 mr-2" />
            Create Packing Slip
          </Button>
        ) : (
          <Button 
            onClick={onInternalUse}
            disabled={selectedItems.length === 0 || !pickerName}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Log Internal Use
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

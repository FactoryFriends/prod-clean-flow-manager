
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers } from "@/hooks/useSuppliers";

interface ProductSupplierSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  productType: string;
  required?: boolean;
}

export function ProductSupplierSelect({ value, onChange, productType, required }: ProductSupplierSelectProps) {
  const { data: suppliers = [] } = useSuppliers();
  const disabled = productType === "zelfgemaakt";

  return (
    <div className="space-y-2">
      <Label htmlFor="supplier_id">Supplier</Label>
      <Select
        value={value ?? ""}
        onValueChange={(val) => onChange(val || null)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-background">
          <SelectValue 
            placeholder={
              productType === "extern" 
                ? "Select supplier…" 
                : "TOTHAI PRODUCTION"
            } 
          />
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          <SelectItem value="">
            {productType === "extern" ? "Select supplier…" : "TOTHAI PRODUCTION"}
          </SelectItem>
          {suppliers.map((sup) => (
            <SelectItem key={sup.id} value={sup.id}>
              {sup.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

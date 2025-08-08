
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

  // For zelfgemaakt products, show a disabled input instead of dropdown
  if (disabled) {
    return (
      <div className="space-y-2">
        <Label>Supplier</Label>
        <div className="w-full border rounded-md px-3 py-2 text-sm bg-muted text-muted-foreground cursor-not-allowed">
          TOTHAI PRODUCTION
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Supplier</Label>
      <Select
        value={value || undefined}
        onValueChange={(val) => onChange(val)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select supplier…" />
        </SelectTrigger>
        <SelectContent className="z-50">
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

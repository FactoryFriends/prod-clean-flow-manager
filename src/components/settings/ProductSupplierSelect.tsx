
import { Label } from "@/components/ui/label";
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
      <select
        id="supplier_id"
        value={value ?? ""}
        onChange={e => onChange(e.target.value || null)}
        disabled={disabled}
        required={required && !disabled}
        className="w-full border rounded-md px-3 py-2 text-sm bg-white"
      >
        <option value="">
          {productType === "extern" ? "Select supplier…" : "TOTHAI PRODUCTION"}
        </option>
        {suppliers.map((sup) => (
          <option key={sup.id} value={sup.id}>
            {sup.name}
          </option>
        ))}
      </select>
    </div>
  );
}

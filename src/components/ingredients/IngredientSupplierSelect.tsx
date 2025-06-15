
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface IngredientSupplierSelectProps {
  control: any;
  suppliers: { id: string; name: string }[];
  productKind: string;
  watch: any;
}

export function IngredientSupplierSelect({ control, suppliers, productKind, watch }: IngredientSupplierSelectProps) {
  return (
    <FormField
      control={control}
      name="supplier_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Supplier</FormLabel>
          <FormControl>
            <select
              {...field}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              disabled={watch("product_kind") === "zelfgemaakt"}
              required={watch("product_kind") === "extern"}
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
            >
              <option value="">
                {watch("product_kind") === "extern"
                  ? "Select supplier…"
                  : "TOTHAI PRODUCTION"}
              </option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default IngredientSupplierSelect;

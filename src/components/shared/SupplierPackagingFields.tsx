
import React from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export interface SupplierPackagingFieldsProps {
  control: any;
  fieldPrefix?: string; // for nested keys if needed, usually blank
  show: boolean;
}

export function SupplierPackagingFields({ control, fieldPrefix = "", show }: SupplierPackagingFieldsProps) {
  if (!show) return null;
  return (
    <>
      <FormField
        control={control}
        name={fieldPrefix + "supplier_package_unit"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase Unit (e.g. CASE, BOX)</FormLabel>
            <FormControl>
              <Input placeholder="e.g. CASE, BOX" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldPrefix + "units_per_package"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Units per Package{" "}
              <span className="text-xs text-muted-foreground">(if relevant)</span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 24"
                {...field}
              />
            </FormControl>
            <div className="text-xs text-muted-foreground">
              Leave blank if not packed as identical units.
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldPrefix + "inner_unit_type"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Inner Unit Type (e.g. BOTTLE, LITER, CAN)</FormLabel>
            <FormControl>
              <Input placeholder="e.g. BOTTLE" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={fieldPrefix + "price_per_package"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price per Purchase Package (€)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export default SupplierPackagingFields;

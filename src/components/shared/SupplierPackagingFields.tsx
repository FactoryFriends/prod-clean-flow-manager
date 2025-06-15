
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useUnitOptions } from "./UnitOptionsContext";
import { Button } from "@/components/ui/button";

export interface SupplierPackagingFieldsProps {
  control: any;
  fieldPrefix?: string; // for nested keys if needed, usually blank
  show: boolean;
}

export function SupplierPackagingFields({ control, fieldPrefix = "", show }: SupplierPackagingFieldsProps) {
  const { purchaseUnits, innerUnits } = useUnitOptions();
  const [addingPurchaseUnit, setAddingPurchaseUnit] = useState(false);
  const [addingInnerUnit, setAddingInnerUnit] = useState(false);

  if (!show) return null;
  return (
    <>
      <FormField
        control={control}
        name={fieldPrefix + "supplier_package_unit"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Purchase Unit
              {/* Optionally: <Button onClick={() => setAddingPurchaseUnit(true)} size="xs" variant="ghost" className="ml-2">＋</Button> */}
            </FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Select purchase unit…</option>
                {purchaseUnits.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
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
            <FormLabel>
              Inner Unit Type
              {/* Optionally: <Button onClick={() => setAddingInnerUnit(true)} size="xs" variant="ghost" className="ml-2">＋</Button> */}
            </FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Select inner unit…</option>
                {innerUnits.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
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

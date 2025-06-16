
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useUnitOptions } from "./UnitOptionsContext";
import { Button } from "@/components/ui/button";

export interface SupplierPackagingFieldsProps {
  control: any;
  fieldPrefix?: string;
  show: boolean;
  supplierName?: string;
}

export function SupplierPackagingFields({ 
  control, 
  fieldPrefix = "", 
  show, 
  supplierName = "your supplier" 
}: SupplierPackagingFieldsProps) {
  const { purchaseUnits, innerUnits } = useUnitOptions();

  if (!show) return null;
  
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-medium text-gray-900">Packaging Information</h3>
      <p className="text-sm text-gray-600">
        Tell us how {supplierName} packages this ingredient:
      </p>
      
      <FormField
        control={control}
        name={fieldPrefix + "supplier_package_unit"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              My supplier delivers this ingredient in a:
            </FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Select how it's packaged...</option>
                {purchaseUnits.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
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
            <FormLabel>And it costs me (€):</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="0.00"
                {...field} 
              />
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
              Each package contains this many units:
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
              Leave blank if the package can't be divided into identical units.
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={fieldPrefix + "inner_unit_type"}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Each unit is measured as:
            </FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Select unit type...</option>
                {innerUnits.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default SupplierPackagingFields;


import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { BatchAndUnitFields } from "./BatchAndUnitFields";

interface SemiFinishedFormFieldsProps {
  suppliers: any[];
  validateUniqueName: (value: string) => string | true;
  unitSize: string;
  batchUnit: string;
}

export function SemiFinishedFormFields({ 
  suppliers, 
  validateUniqueName, 
  unitSize, 
  batchUnit 
}: SemiFinishedFormFieldsProps) {
  const { control } = useFormContext();

  return (
    <>
      {/* Basic info fields */}
      <FormField
        control={control}
        name="name"
        rules={{
          required: "Name is required",
          validate: validateUniqueName,
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Homemade Curry Base" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* BATCH section - moved up here after NAME */}
      <BatchAndUnitFields />

      {/* Auto-calculated unit size */}
      <div>
        <FormLabel>
          Unit Size (auto-calculated)
        </FormLabel>
        <Input
          readOnly
          value={
            unitSize +
            (batchUnit ? ` ${batchUnit}` : "")
          }
          className="bg-gray-100 cursor-not-allowed"
        />
        <div className="text-xs text-muted-foreground italic mt-1">
          <span>
            Each unit will have this size. <br />
            For example: If a batch is 20 liters and makes 5 units, then unit size = 4,00 liters.
          </span>
        </div>
      </div>

      {/* Supplier */}
      <FormField
        control={control}
        name="supplier_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplier (optional)</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">None</option>
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

      {/* Shelf life input - SIMPLE NUMERIC INPUT */}
      <FormField
        control={control}
        name="shelf_life_days"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Shelf life (days)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g. 7"
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === "" ? null : Number(value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Labour time input - SIMPLE NUMERIC INPUT */}
      <FormField
        control={control}
        name="labour_time_minutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Labour time (minutes)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 45 or 45.5"
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === "" ? null : Number(value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Active / Inactive Toggle */}
      <FormField
        control={control}
        name="active"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
              <FormLabel>{field.value ? "Active" : "Inactive"}</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}

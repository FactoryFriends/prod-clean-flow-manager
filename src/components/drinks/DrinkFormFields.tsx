
import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { DRINK_UNIT_OPTIONS } from "./DrinkFormData";
import { useAllProducts } from "@/hooks/useProductionData";
import SupplierPackagingFields from "../shared/SupplierPackagingFields";

interface DrinkFormFieldsProps {
  control: any;
  suppliers: any[];
  selectedSupplierId: string;
  supplierName: string;
  pricePerPackage: number;
  unitsPerPackage: number;
}

export function DrinkFormFields({
  control,
  suppliers,
  selectedSupplierId,
  supplierName,
  pricePerPackage,
  unitsPerPackage,
}: DrinkFormFieldsProps) {
  const { data: allProducts } = useAllProducts();

  function validateUniqueName(value: string) {
    if (!allProducts) return true;
    const exists = allProducts.some(
      (p) => p.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    return exists ? "Name already exists – please choose a unique name." : true;
  }

  return (
    <>
      <FormField
        control={control}
        name="name"
        rules={{ required: "Name is required", validate: validateUniqueName }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Coca Cola 330ml" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="unit_size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit Size</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="unit_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unit Type</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              >
                {DRINK_UNIT_OPTIONS.map((u) => (
                  <option value={u} key={u}>
                    {u}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="supplier_id"
        rules={{ required: "Supplier is required for drinks" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplier</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Select supplier…</option>
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

      {selectedSupplierId && (
        <SupplierPackagingFields 
          control={control} 
          show={true} 
          supplierName={supplierName}
        />
      )}

      {pricePerPackage > 0 && unitsPerPackage > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            ✓ Calculated price per unit: €{(pricePerPackage / unitsPerPackage).toFixed(4)}
          </p>
        </div>
      )}

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

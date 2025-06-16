
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
        <div className="space-y-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-center">
            <h3 className="font-semibold text-lg text-blue-900 mb-2">Tell us about your supplier's packaging</h3>
            <p className="text-sm text-blue-700">
              Help us calculate the exact cost per unit by describing how {supplierName} packages this drink.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <p className="text-base text-gray-800 mb-4 leading-relaxed">
              My supplier <strong className="text-blue-600">{supplierName}</strong> delivers this drink in a{" "}
              <span className="inline-block min-w-[120px] text-blue-600 font-semibold">
                <FormField
                  control={control}
                  name="supplier_package_unit"
                  render={({ field }) => (
                    <FormItem className="inline-block">
                      <FormControl>
                        <select
                          {...field}
                          className="inline border-b-2 border-blue-300 bg-transparent px-2 py-1 text-blue-600 font-semibold focus:border-blue-500 focus:outline-none text-base"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="">___</option>
                          <option value="CASE">CASE</option>
                          <option value="BOX">BOX</option>
                          <option value="PACK">PACK</option>
                          <option value="CARTON">CARTON</option>
                          <option value="CRATE">CRATE</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </span>
              , and it costs me{" "}
              <span className="inline-block min-w-[80px] text-blue-600 font-semibold">
                €<FormField
                  control={control}
                  name="price_per_package"
                  render={({ field }) => (
                    <FormItem className="inline-block">
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="0.00"
                          className="inline w-20 border-b-2 border-blue-300 bg-transparent px-1 py-0 text-blue-600 font-semibold focus:border-blue-500 border-t-0 border-l-0 border-r-0 rounded-none text-base"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </span>
              .
            </p>
            
            <p className="text-base text-gray-800 mb-4 leading-relaxed">
              Each package contains{" "}
              <span className="inline-block min-w-[60px] text-blue-600 font-semibold">
                <FormField
                  control={control}
                  name="units_per_package"
                  render={({ field }) => (
                    <FormItem className="inline-block">
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          className="inline w-16 border-b-2 border-blue-300 bg-transparent px-1 py-0 text-blue-600 font-semibold focus:border-blue-500 border-t-0 border-l-0 border-r-0 rounded-none text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </span>
              {" "}units, and each unit is measured as{" "}
              <span className="inline-block min-w-[100px] text-blue-600 font-semibold">
                <FormField
                  control={control}
                  name="inner_unit_type"
                  render={({ field }) => (
                    <FormItem className="inline-block">
                      <FormControl>
                        <select
                          {...field}
                          className="inline border-b-2 border-blue-300 bg-transparent px-2 py-1 text-blue-600 font-semibold focus:border-blue-500 focus:outline-none text-base"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="">___</option>
                          {DRINK_UNIT_OPTIONS.map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </span>
              .
            </p>
          </div>
        </div>
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

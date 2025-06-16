
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
    <div className="space-y-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
      <div className="text-center">
        <h3 className="font-semibold text-lg text-blue-900 mb-2">Tell us about your supplier's packaging</h3>
        <p className="text-sm text-blue-700">
          Help us calculate the exact cost per unit by describing how {supplierName} packages this ingredient.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <p className="text-base text-gray-800 mb-4 leading-relaxed">
          My supplier <strong className="text-blue-600">{supplierName}</strong> delivers this ingredient in a{" "}
          <span className="inline-block min-w-[120px] text-blue-600 font-semibold">
            <FormField
              control={control}
              name={fieldPrefix + "supplier_package_unit"}
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
                      {purchaseUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
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
              name={fieldPrefix + "price_per_package"}
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
              name={fieldPrefix + "units_per_package"}
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
              name={fieldPrefix + "inner_unit_type"}
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
                      {innerUnits.map((unit) => (
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
  );
}

export default SupplierPackagingFields;

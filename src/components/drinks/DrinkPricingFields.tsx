
import React from "react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { DRINK_VAT_OPTIONS } from "./DrinkFormData";

interface DrinkPricingFieldsProps {
  control: any;
  cost: number;
  markupPercent: number;
  calculatedSalesPrice: number;
  deltaSalesPrice: number;
  deltaColor: string;
  vatRate: number;
}

export function DrinkPricingFields({
  control,
  cost,
  markupPercent,
  calculatedSalesPrice,
  deltaSalesPrice,
  deltaColor,
  vatRate,
}: DrinkPricingFieldsProps) {
  const calculatedSalesPriceWithVAT = calculatedSalesPrice * (1 + vatRate / 100);
  const finalSalesPriceInclVAT = Number(control._formValues?.sales_price) || 0;
  const finalSalesPriceExclVAT = finalSalesPriceInclVAT / (1 + vatRate / 100);
  const deltaWithVAT = calculatedSalesPriceWithVAT - finalSalesPriceInclVAT;
  const deltaVATColor = deltaWithVAT >= 0 ? "text-green-700" : "text-red-600";

  return (
    <>
      <FormField
        control={control}
        name="cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cost (€)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="markup_percent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Markup (%)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="vat_rate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>VAT Rate</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={field.value || 6}
                onChange={(e) => field.onChange(Number(e.target.value))}
              >
                {DRINK_VAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormControl>
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Calculated Sales Price (excl. VAT) (€)</FormLabel>
        <Input
          value={calculatedSalesPrice.toFixed(2)}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
        <div className="text-xs text-muted-foreground italic mt-1">
          Calculated: Cost + (Cost × Markup %)
        </div>
      </div>

      <div>
        <FormLabel>Calculated Sales Price (incl. VAT) (€)</FormLabel>
        <Input
          value={calculatedSalesPriceWithVAT.toFixed(2)}
          readOnly
          disabled
          className="bg-blue-100 cursor-not-allowed font-semibold text-blue-800"
        />
        <div className="text-xs text-blue-600 italic mt-1">
          Includes {vatRate}% VAT (€{(calculatedSalesPriceWithVAT - calculatedSalesPrice).toFixed(2)})
        </div>
      </div>

      <FormField
        control={control}
        name="sales_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Final Sales Price (incl. VAT) (€)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Final Sales Price (excl. VAT) (€)</FormLabel>
        <Input
          value={finalSalesPriceExclVAT.toFixed(2)}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
        <div className="text-xs text-gray-600 italic mt-1">
          Excluding {vatRate}% VAT from final price
        </div>
      </div>

      <div>
        <FormLabel>Delta (excl. VAT) (€)</FormLabel>
        <Input
          value={deltaSalesPrice.toFixed(2)}
          readOnly
          disabled
          className={`bg-gray-100 cursor-not-allowed font-semibold ${deltaColor}`}
        />
      </div>

      <div>
        <FormLabel>Delta (incl. VAT) (€)</FormLabel>
        <Input
          value={deltaWithVAT.toFixed(2)}
          readOnly
          disabled
          className={`bg-gray-100 cursor-not-allowed font-semibold ${deltaVATColor}`}
        />
        <div className={`text-xs mt-1 italic ${deltaVATColor}`}>
          {deltaWithVAT >= 0
            ? "Final price (incl. VAT) is equal or below calculated (OK)"
            : "Final price (incl. VAT) is higher than calculated!"}
        </div>
      </div>
    </>
  );
}

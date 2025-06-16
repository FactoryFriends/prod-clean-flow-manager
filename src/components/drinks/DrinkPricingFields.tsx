
import React from "react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";

interface DrinkPricingFieldsProps {
  control: any;
  cost: number;
  markupPercent: number;
  calculatedSalesPrice: number;
  deltaSalesPrice: number;
  deltaColor: string;
}

export function DrinkPricingFields({
  control,
  cost,
  markupPercent,
  calculatedSalesPrice,
  deltaSalesPrice,
  deltaColor,
}: DrinkPricingFieldsProps) {
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

      <div>
        <FormLabel>Calculated Sales Price (€)</FormLabel>
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

      <FormField
        control={control}
        name="sales_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Final Sales Price (€)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Delta (€)</FormLabel>
        <Input
          value={deltaSalesPrice.toFixed(2)}
          readOnly
          disabled
          className={`bg-gray-100 cursor-not-allowed font-semibold ${deltaColor}`}
        />
        <div className={`text-xs mt-1 italic ${deltaColor}`}>
          {deltaSalesPrice >= 0
            ? "Final sales price is equal or below calculated (OK)"
            : "Final sales price is higher than calculated!"}
        </div>
      </div>
    </>
  );
}

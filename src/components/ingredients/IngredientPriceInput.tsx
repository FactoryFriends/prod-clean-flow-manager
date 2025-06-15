
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function IngredientPriceInput({ control }: { control: any }) {
  return (
    <FormField
      control={control}
      name="price_per_unit"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Price per unit (€)</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              step="0.01"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default IngredientPriceInput;

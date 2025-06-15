
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function IngredientUnitSizeInput({ control }: { control: any }) {
  return (
    <FormField
      control={control}
      name="unit_size"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Package Size</FormLabel>
          <FormControl>
            <Input type="number" step="0.01" min="0" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default IngredientUnitSizeInput;

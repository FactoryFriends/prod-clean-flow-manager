
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

export function IngredientSourceSelect({ control }: { control: any }) {
  return (
    <FormField
      control={control}
      name="product_kind"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Source</FormLabel>
          <FormControl>
            <select
              {...field}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="zelfgemaakt">Self-made</option>
              <option value="extern">Purchased externally</option>
            </select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default IngredientSourceSelect;

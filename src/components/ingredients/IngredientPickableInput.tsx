
import React from "react";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

export function IngredientPickableInput({ control }: { control: any }) {
  return (
    <FormField
      control={control}
      name="pickable"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel className="mb-0">Pickable for distribution</FormLabel>
        </FormItem>
      )}
    />
  );
}

export default IngredientPickableInput;

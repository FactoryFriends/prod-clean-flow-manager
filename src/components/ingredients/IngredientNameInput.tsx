
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function IngredientNameInput({ control, validateUniqueName }: { control: any; validateUniqueName: (value: string) => true | string }) {
  return (
    <FormField
      control={control}
      name="name"
      rules={{ required: "Name is required", validate: validateUniqueName }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input placeholder="e.g. Scampi 13/15 frozen" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default IngredientNameInput;

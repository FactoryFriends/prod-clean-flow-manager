
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useUnitOptions } from "../shared/UnitOptionsContext";

export function IngredientUnitTypeSelect({ control }: { control: any }) {
  const { innerUnits } = useUnitOptions();

  return (
    <FormField
      control={control}
      name="unit_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Unit</FormLabel>
          <FormControl>
            <select
              {...field}
              value={field.value || innerUnits[0] || ""}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            >
              {innerUnits.map((u) => (
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
  );
}

export default IngredientUnitTypeSelect;

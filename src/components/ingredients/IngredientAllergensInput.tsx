
import React from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ALLERGENS } from "./constants/allergens";

interface IngredientAllergensInputProps {
  control: any;
}

export function IngredientAllergensInput({ control }: IngredientAllergensInputProps) {
  return (
    <FormField
      control={control}
      name="allergens"
      render={({ field }) => {
        const value = field.value || [];
        const handleChange = (allergen: string) => {
          if (allergen === "No Allergens") {
            field.onChange(
              value.includes("No Allergens") ? [] : ["No Allergens"]
            );
          } else {
            let next;
            if (value.includes(allergen)) {
              next = value.filter((val: string) => val !== allergen);
            } else {
              next = [...(value || []).filter((val) => val !== "No Allergens"), allergen];
            }
            field.onChange(next);
          }
        };

        return (
          <FormItem>
            <FormLabel>Allergens</FormLabel>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((a) => (
                <label
                  key={a.english}
                  className="flex items-center gap-1 text-xs bg-gray-50 border rounded px-2 py-1"
                >
                  <input
                    type="checkbox"
                    checked={value?.includes(a.english)}
                    onChange={() => handleChange(a.english)}
                    disabled={
                      a.english !== "No Allergens" && value?.includes("No Allergens")
                    }
                  />
                  {a.english} / {a.dutch}
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default IngredientAllergensInput;

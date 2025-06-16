
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { formatNumberComma, RecipeIngredient } from "./semifinishedFormUtils";

// Placeholder for calculated price (implement actual logic later)
function calculatePricePlaceholder(
  recipe: RecipeIngredient[],
  allProducts: any[] | undefined
) {
  // TODO: fetch ingredient prices and compute for now just a placeholder
  // You could sum ingredient cost here if available
  return "Calculated from recipe";
}

interface PricingFieldsProps {
  recipe: RecipeIngredient[];
  allProducts: any[] | undefined;
}

export function PricingFields({ recipe, allProducts }: PricingFieldsProps) {
  const { control } = useFormContext();

  return (
    <>
      {/* Calculated price/batch field */}
      <div>
        <FormLabel>Estimated price/batch (€)</FormLabel>
        <Input
          value={calculatePricePlaceholder(recipe, allProducts)}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
        <div className="text-xs text-muted-foreground italic mt-1">
          Price is automatically calculated from the ingredient recipe per batch.
        </div>
      </div>
    </>
  );
}

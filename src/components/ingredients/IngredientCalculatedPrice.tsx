
import React from "react";
import { Input } from "@/components/ui/input";

interface IngredientCalculatedPriceProps {
  pricePerPackage: number;
  unitsPerPackage: number;
}

export function IngredientCalculatedPrice({ pricePerPackage, unitsPerPackage }: IngredientCalculatedPriceProps) {
  return (
    <div>
      <label className="block font-medium mb-1">Price per Unit (€)</label>
      <Input
        value={
          pricePerPackage && unitsPerPackage > 0
            ? (pricePerPackage / unitsPerPackage).toFixed(4)
            : pricePerPackage
            ? pricePerPackage.toFixed(4)
            : ""
        }
        readOnly
        disabled
        className="bg-gray-100 cursor-not-allowed"
      />
      <div className="text-xs text-muted-foreground italic mt-1">
        {pricePerPackage && unitsPerPackage > 0
          ? `Calculated: ${pricePerPackage} / ${unitsPerPackage}`
          : `Equal to package price if not packed as units`}
      </div>
    </div>
  );
}

export default IngredientCalculatedPrice;

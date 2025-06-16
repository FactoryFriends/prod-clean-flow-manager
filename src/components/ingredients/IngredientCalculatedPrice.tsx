
import React from "react";
import { Input } from "@/components/ui/input";
import PackagingExplanation from "../shared/PackagingExplanation";

interface IngredientCalculatedPriceProps {
  pricePerPackage: number;
  unitsPerPackage: number;
  supplierName?: string;
  purchaseUnit?: string;
}

export function IngredientCalculatedPrice({ 
  pricePerPackage, 
  unitsPerPackage,
  supplierName = "your supplier",
  purchaseUnit = "package"
}: IngredientCalculatedPriceProps) {
  const calculatedPrice = pricePerPackage && unitsPerPackage > 0 
    ? pricePerPackage / unitsPerPackage 
    : pricePerPackage || 0;

  return (
    <div className="space-y-3">
      {pricePerPackage && unitsPerPackage > 0 && (
        <PackagingExplanation
          supplierName={supplierName}
          purchaseUnit={purchaseUnit}
          pricePerPackage={pricePerPackage}
          unitsPerPackage={unitsPerPackage}
          calculatedPricePerUnit={calculatedPrice}
        />
      )}
      
      <div>
        <label className="block font-medium mb-1">Calculated Cost per Unit (€)</label>
        <Input
          value={calculatedPrice.toFixed(4)}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
        <div className="text-xs text-muted-foreground italic mt-1">
          {pricePerPackage && unitsPerPackage > 0
            ? `This will be used as your ingredient cost`
            : `Enter packaging details above to calculate unit cost`}
        </div>
      </div>
    </div>
  );
}

export default IngredientCalculatedPrice;

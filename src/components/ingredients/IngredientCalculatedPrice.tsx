
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
    </div>
  );
}

export default IngredientCalculatedPrice;

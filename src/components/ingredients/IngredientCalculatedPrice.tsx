
import React from "react";
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
        <>
          <PackagingExplanation
            supplierName={supplierName}
            purchaseUnit={purchaseUnit}
            pricePerPackage={pricePerPackage}
            unitsPerPackage={unitsPerPackage}
            calculatedPricePerUnit={calculatedPrice}
          />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              ✓ This calculated price (€{calculatedPrice.toFixed(4)} per unit) will be automatically used for all recipe cost calculations.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default IngredientCalculatedPrice;

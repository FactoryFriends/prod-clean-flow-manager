
import React from "react";

interface PackagingExplanationProps {
  supplierName: string;
  purchaseUnit: string;
  pricePerPackage: number;
  unitsPerPackage: number;
  calculatedPricePerUnit: number;
}

export function PackagingExplanation({
  supplierName,
  purchaseUnit,
  pricePerPackage,
  unitsPerPackage,
  calculatedPricePerUnit
}: PackagingExplanationProps) {
  if (!supplierName || !purchaseUnit || !pricePerPackage || !unitsPerPackage) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="text-center">
        <h4 className="font-semibold text-green-800 mb-2">✓ Calculation Complete</h4>
        <p className="text-lg text-green-700 leading-relaxed">
          So the cost per unit is{" "}
          <span className="text-2xl font-bold text-green-800">
            €{calculatedPricePerUnit.toFixed(4)}
          </span>
        </p>
        <p className="text-sm text-green-600 mt-2">
          (€{pricePerPackage.toFixed(2)} ÷ {unitsPerPackage} units = €{calculatedPricePerUnit.toFixed(4)} per unit)
        </p>
      </div>
    </div>
  );
}

export default PackagingExplanation;

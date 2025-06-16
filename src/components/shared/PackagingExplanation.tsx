
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
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
      <p className="text-blue-800">
        My supplier <strong>{supplierName}</strong> delivers this ingredient in a{" "}
        <strong>{purchaseUnit}</strong>, and it costs me <strong>€{pricePerPackage.toFixed(2)}</strong>.{" "}
        Each <strong>{purchaseUnit}</strong> contains{" "}
        <strong>{unitsPerPackage}</strong> units, so the cost per unit is{" "}
        <strong>€{calculatedPricePerUnit.toFixed(4)}</strong>.
      </p>
    </div>
  );
}

export default PackagingExplanation;

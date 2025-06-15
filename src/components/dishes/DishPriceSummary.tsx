
import React from "react";

type DishPriceSummaryProps = {
  cost: number;
  markupPercent: number;
  fixedSalesPrice: number;
  minimalMargin: number | undefined;
};

export function DishPriceSummary({ cost, markupPercent, fixedSalesPrice, minimalMargin }: DishPriceSummaryProps) {
  // Calculated sales price based on cost + markup
  const calculatedSalesPrice = cost + (cost * markupPercent / 100);

  // Delta: calculated - fixed sales price
  const deltaSalesPrice = calculatedSalesPrice - fixedSalesPrice;
  const deltaColor = deltaSalesPrice >= 0
    ? "text-green-700"
    : "text-red-600";

  // Margin calculations
  const marginPct =
    fixedSalesPrice && cost && Number(fixedSalesPrice) > 0
      ? ((Number(fixedSalesPrice) - Number(cost)) / Number(fixedSalesPrice)) * 100
      : null;
  const showMarginAlarm =
    marginPct !== null &&
    minimalMargin !== undefined &&
    marginPct < minimalMargin;

  return (
    <div className="space-y-2">
      {/* CALCULATED SALES PRICE */}
      <div>
        <div className="font-medium">Calculated Sales Price (€)</div>
        <input
          value={calculatedSalesPrice.toFixed(2)}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed w-full font-semibold"
        />
        <div className="text-xs text-muted-foreground italic mt-1">
          Calculated: Cost + (Cost × Markup %)
        </div>
      </div>

      {/* DELTA */}
      <div>
        <div className="font-medium">Delta (€)</div>
        <input
          value={deltaSalesPrice.toFixed(2)}
          readOnly
          disabled
          className={`bg-gray-100 cursor-not-allowed font-semibold w-full ${deltaColor}`}
        />
        <div className={`text-xs mt-1 italic ${deltaColor}`}>
          {deltaSalesPrice >= 0
            ? "Fixed sales price is equal or below calculated (OK)"
            : "Fixed sales price is higher than calculated!"}
        </div>
      </div>

      {/* Effective Margin */}
      <div className="text-sm font-medium mt-2">
        Effective Margin:{" "}
        <span className={showMarginAlarm ? "text-red-600" : "text-green-700"}>
          {marginPct !== null ? `${marginPct.toFixed(2)}%` : "—"}
        </span>
        {showMarginAlarm && (
          <span className="ml-2 text-red-500 font-bold animate-pulse">
            ⚠ Below minimal threshold!
          </span>
        )}
      </div>
    </div>
  );
}

export default DishPriceSummary;

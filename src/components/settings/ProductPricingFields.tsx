
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface ProductPricingFieldsProps {
  cost: number;
  markup_percent: number;
  sales_price: number;
  minimal_margin_threshold_percent: number;
  onChange: (field: string, value: number) => void;
}

export function ProductPricingFields({
  cost,
  markup_percent,
  sales_price,
  minimal_margin_threshold_percent,
  onChange,
}: ProductPricingFieldsProps) {
  const calculatedSalesPrice = Number(cost) + (Number(cost) * Number(markup_percent) / 100);
  const deltaSalesPrice = calculatedSalesPrice - Number(sales_price);
  const deltaColor = deltaSalesPrice >= 0 ? "text-green-700" : "text-red-600";
  const marginPct =
    sales_price && cost && Number(sales_price) > 0
      ? ((Number(sales_price) - Number(cost)) / Number(sales_price)) * 100
      : null;
  const showMarginAlarm =
    marginPct !== null &&
    minimal_margin_threshold_percent !== undefined &&
    marginPct < minimal_margin_threshold_percent;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cost">Cost (€)</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          min="0"
          value={cost ?? ""}
          onChange={e => onChange("cost", e.target.value ? Number(e.target.value) : 0)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="markup_percent">Markup (%)</Label>
        <Input
          id="markup_percent"
          type="number"
          step="0.01"
          min="0"
          value={markup_percent ?? ""}
          onChange={e => onChange("markup_percent", e.target.value ? Number(e.target.value) : 0)}
        />
      </div>

      <div>
        <Label>Calculated Sales Price (€)</Label>
        <Input
          value={calculatedSalesPrice.toFixed(2)}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
        <div className="text-xs text-muted-foreground italic mt-1">
          Calculated: Cost + (Cost × Markup %)
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sales_price">Sales Price (€)</Label>
        <Input
          id="sales_price"
          type="number"
          step="0.01"
          min="0"
          value={sales_price ?? ""}
          onChange={e => onChange("sales_price", e.target.value ? Number(e.target.value) : 0)}
        />
      </div>

      <div>
        <Label>Delta (€)</Label>
        <Input
          value={deltaSalesPrice.toFixed(2)}
          readOnly
          disabled
          className={`bg-gray-100 cursor-not-allowed font-semibold ${deltaColor}`}
        />
        <div className={`text-xs mt-1 italic ${deltaColor}`}>
          {deltaSalesPrice >= 0
            ? "Fixed sales price is equal or below calculated (OK)"
            : "Fixed sales price is higher than calculated!"}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimal_margin_threshold_percent">Minimal Margin Threshold (%)</Label>
        <Input
          id="minimal_margin_threshold_percent"
          type="number"
          step="0.01"
          min="0"
          value={minimal_margin_threshold_percent ?? ""}
          onChange={e => onChange("minimal_margin_threshold_percent", e.target.value ? Number(e.target.value) : 25)}
        />
      </div>

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

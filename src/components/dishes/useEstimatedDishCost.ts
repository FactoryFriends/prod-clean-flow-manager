
import { Product } from "@/hooks/useProductionData";

export function estimatedDishPrice(recipeArr: any[], allProductsArr: Product[], labourMinutes: number, laborCostPerMinute: number = 0.5): number {
  let cost = 0;
  for (const ri of recipeArr) {
    const matched = allProductsArr?.find(p => p.id === ri.product_id);
    if (matched && matched.price_per_unit != null && matched.unit_size) {
      cost += (
        Number(ri.qty) / Number(matched.unit_size)
      ) * Number(matched.price_per_unit);
    }
  }
  if (labourMinutes && !isNaN(labourMinutes)) {
    cost += Number(labourMinutes) * laborCostPerMinute;
  }
  return Math.round(cost * 100) / 100;
}

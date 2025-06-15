
import { useAllProducts } from "@/hooks/useProductionData";
import { useMemo } from "react";

// Helper to roll up allergens from dish's ingredients and semi-finished products (externally fetched as products)
export function useDishAllergens(dish, allProducts) {
  // dish: { name, id, recipe_ingredients, recipe_semifinished }
  return useMemo(() => {
    if (!dish || !allProducts) return [];
    // Collect all ingredient IDs
    const ingredientIds = (dish.recipe_ingredients || []).map(ri => ri.ingredient_id);
    const semiFinishedIds = (dish.recipe_semifinished || []).map(sf => sf.semifinished_id);
    // Find products in allProducts
    const ingredientAllergens = ingredientIds
      .map(id => allProducts.find(p => p.id === id)?.allergens || [])
      .flat();
    const semiFinishedAllergens = semiFinishedIds
      .map(id => allProducts.find(p => p.id === id)?.allergens || [])
      .flat();
    // Combine, dedupe, and remove "No Allergens" if any real allergens exist
    let all = [...ingredientAllergens, ...semiFinishedAllergens];
    all = all.filter(Boolean);
    const unique = Array.from(new Set(all));
    if (unique.length > 1 && unique.includes("No Allergens")) {
      return unique.filter(a => a !== "No Allergens");
    }
    return unique;
  }, [dish, allProducts]);
}

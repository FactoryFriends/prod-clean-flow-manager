
import { useAllProducts } from "@/hooks/useProductionData";

export function useIngredientFormValidation() {
  const { data: allProducts } = useAllProducts();

  function validateUniqueName(value: string) {
    if (!allProducts) return true;
    const testVal = value.trim().toLowerCase();
    const exists = allProducts.some(
      (p) => (p.name ?? '').trim().toLowerCase() === testVal
    );
    return exists ? "Name already exists – please choose a unique name." : true;
  }

  function validatePositive(v: any, label: string) {
    const n = Number(v);
    if (isNaN(n) || n <= 0) return `${label} must be a positive number`;
    return true;
  }

  return { validateUniqueName, validatePositive };
}

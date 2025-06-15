
export type IngredientFormData = {
  name: string;
  unit_size: number;
  unit_type: string;
  supplier_name: string;
  price_per_unit: number;
  product_kind: "zelfgemaakt" | "extern";
  pickable: boolean;
  allergens: string[];
};

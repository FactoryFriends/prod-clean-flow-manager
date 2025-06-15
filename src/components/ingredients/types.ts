
export type IngredientFormData = {
  name: string;
  unit_size: number;
  unit_type: string;
  supplier_name: string;
  price_per_unit: number;
  product_kind: "zelfgemaakt" | "extern";
  pickable: boolean;
  allergens: string[];
  supplier_id?: string;
  product_fiche_url?: string;
  // Added external purchase packaging fields:
  supplier_package_unit?: string;
  units_per_package?: number | null;
  inner_unit_type?: string;
  price_per_package?: number | null;
};

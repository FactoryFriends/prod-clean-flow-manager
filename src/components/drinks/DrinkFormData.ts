
export const DRINK_UNIT_OPTIONS = ["BOTTLE", "CAN", "LITER", "PIECE"];

export interface DrinkFormData {
  name: string;
  unit_size: number;
  unit_type: string;
  supplier_id: string;
  price_per_unit: number;
  active: boolean;
  cost: number;
  markup_percent: number;
  sales_price: number;
  supplier_package_unit?: string;
  units_per_package?: number;
  inner_unit_type?: string;
  price_per_package?: number;
}

export const defaultDrinkFormValues: DrinkFormData = {
  name: "",
  unit_size: 1,
  unit_type: "BOTTLE",
  supplier_id: "",
  price_per_unit: 0,
  active: true,
  cost: 0,
  markup_percent: 0,
  sales_price: 0,
  supplier_package_unit: "",
  units_per_package: undefined,
  inner_unit_type: "",
  price_per_package: undefined,
};


export type SemiFinishedFormData = {
  name: string;
  batch_size: number;
  batch_unit: string;
  packages_per_batch: number;
  unit_size: number;
  unit_type: string;
  supplier_id?: string;
  shelf_life_days: number | null;
  labour_time_minutes: number | null;
};

export type RecipeIngredient = {
  product_id: string;
  name: string;
  qty: number;
  unit: string;
};

export const UNIT_OPTIONS = ["BAG", "KG", "BOX", "LITER", "PIECE"];

export function formatNumberComma(n: number | string | undefined | null) {
  if (n === undefined || n === null || n === "") return "";
  const numberVal = typeof n === "number" ? n : parseFloat(String(n).replace(",", "."));
  if (isNaN(numberVal)) return "";
  return numberVal.toFixed(2).replace(".", ",");
}

export function parseNumberComma(s: string) {
  if (!s) return undefined;
  return parseFloat(s.replace(",", "."));
}

export function calculateUnitSize(batchSize: number, packagesPerBatch: number) {
  if (!batchSize || !packagesPerBatch || packagesPerBatch <= 0) return "";
  const v = batchSize / packagesPerBatch;
  return formatNumberComma(v);
}

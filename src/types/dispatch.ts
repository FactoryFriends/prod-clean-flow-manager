
export interface SelectedItem {
  id: string;
  type: 'batch' | 'external' | 'ingredient';
  name: string;
  batchNumber?: string;
  availableQuantity?: number;
  selectedQuantity: number;
  expiryDate?: string;
  productionDate?: string;
  supplier?: string;
  productType?: string;
  innerUnitType?: string;
}

export interface ExternalProduct {
  id: string;
  name: string;
  supplier: string;
}

export interface StaffCode {
  code: string;
  name: string;
  role: string;
}

export type DispatchType = "external" | "internal";


export interface PDFItem {
  id: string;
  name: string;
  batchNumber?: string;
  selectedQuantity: number;
  productionDate?: string;
  type?: string;
  product_type?: string;
  product_kind?: string;
  unitType?: string;
  innerUnitType?: string;
}

export interface PDFData {
  packingSlipNumber: string;
  currentDate: string;
  destinationCustomer: {
    name: string;
    address?: string;
    contact_person?: string;
    phone?: string;
  } | null;
  selectedItems: PDFItem[];
  totalItems: number;
  totalPackages: number;
  preparedBy: string;
  pickedUpBy: string;
}

import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExportSemiFinished {
  id: string;
  name: string;
  supplier_name?: string | null;
  supplier_package_unit?: string | null;
  price_per_package?: number | null;
  units_per_package?: number | null;
  unit_type?: string | null;
  cost?: number | null;
  markup_percent?: number | null;
  sales_price?: number | null;
  allergens?: string[] | null;
  pickable: boolean;
  product_type: string;
  product_kind: string;
  active: boolean;
  packages_per_batch?: number | null;
  shelf_life_days?: number | null;
}

export const exportSemiFinishedToExcel = (semiFinished: ExportSemiFinished[]) => {
  if (!semiFinished || semiFinished.length === 0) {
    toast.error("No semi-finished products to export");
    return;
  }

  // Create the data array for Excel
  const excelData = semiFinished.map(product => ({
    'Name': product.name || '',
    'Unit Type': product.unit_type || '',
    'Cost': product.cost || '',
    'Markup %': product.markup_percent || '',
    'Sales Price': product.sales_price || '',
    'Packages per Batch': product.packages_per_batch || '',
    'Shelf Life (Days)': product.shelf_life_days || '',
    'Supplier Name': product.supplier_name || '',
    'Package Unit': product.supplier_package_unit || '',
    'Price per Package': product.price_per_package || '',
    'Units per Package': product.units_per_package || '',
    'Allergens': product.allergens?.length > 0 ? product.allergens.join(', ') : 'No Allergens',
    'Pickable': product.pickable ? 'Yes' : 'No',
    'Product Type': product.product_type || '',
    'Product Kind': product.product_kind || '',
    'Active': product.active ? 'Yes' : 'No'
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for better readability
  const colWidths = [
    { wch: 25 }, // Name
    { wch: 15 }, // Unit Type
    { wch: 12 }, // Cost
    { wch: 12 }, // Markup %
    { wch: 15 }, // Sales Price
    { wch: 18 }, // Packages per Batch
    { wch: 18 }, // Shelf Life (Days)
    { wch: 20 }, // Supplier Name
    { wch: 15 }, // Package Unit
    { wch: 18 }, // Price per Package
    { wch: 18 }, // Units per Package
    { wch: 25 }, // Allergens
    { wch: 10 }, // Pickable
    { wch: 15 }, // Product Type
    { wch: 15 }, // Product Kind
    { wch: 10 }  // Active
  ];
  ws['!cols'] = colWidths;

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Semi-finished Export');

  // Generate filename with current date
  const currentDate = new Date().toISOString().split('T')[0];
  const filename = `semi_finished_export_${currentDate}.xlsx`;

  // Download the file
  XLSX.writeFile(wb, filename);

  toast.success(`${semiFinished.length} semi-finished products exported successfully!`);
};
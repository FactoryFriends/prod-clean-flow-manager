
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { ALLERGENS_ENGLISH } from '@/components/ingredients/constants/allergens';

interface ExportIngredient {
  id: string;
  name: string;
  supplier_name?: string | null;
  supplier_package_unit?: string | null;
  price_per_package?: number | null;
  units_per_package?: number | null;
  inner_unit_type?: string | null;
  allergens?: string[] | null;
  pickable: boolean;
  product_type: string;
  active: boolean;
}

export const exportIngredientsToExcel = (ingredients: ExportIngredient[]) => {
  if (!ingredients || ingredients.length === 0) {
    toast.error("No ingredients to export");
    return;
  }

  // Filter only actual ingredients (extern products)
  const actualIngredients = ingredients.filter(p => p.product_type === "extern");

  if (actualIngredients.length === 0) {
    toast.error("No ingredients found to export");
    return;
  }

  // Create the data array for Excel
  const excelData = actualIngredients.map(ingredient => ({
    'Name': ingredient.name || '',
    'Supplier Name': ingredient.supplier_name || '',
    'Package Unit': ingredient.supplier_package_unit || '',
    'Price per Package': ingredient.price_per_package || '',
    'Units per Package': ingredient.units_per_package || '',
    'Inner Unit Type': ingredient.inner_unit_type || '',
    'Allergens': ingredient.allergens?.length > 0 ? ingredient.allergens.join(', ') : 'No Allergens',
    'Pickable': ingredient.pickable ? 'Yes' : 'No',
    'Product Type': ingredient.product_type || '',
    'Active': ingredient.active ? 'Yes' : 'No'
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for better readability
  const colWidths = [
    { wch: 25 }, // Name
    { wch: 20 }, // Supplier Name
    { wch: 15 }, // Package Unit
    { wch: 18 }, // Price per Package
    { wch: 18 }, // Units per Package
    { wch: 15 }, // Inner Unit Type
    { wch: 25 }, // Allergens
    { wch: 10 }, // Pickable
    { wch: 15 }, // Product Type
    { wch: 10 }  // Active
  ];
  ws['!cols'] = colWidths;

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredients Export');

  // Generate filename with current date
  const currentDate = new Date().toISOString().split('T')[0];
  const filename = `ingredients_export_${currentDate}.xlsx`;

  // Download the file
  XLSX.writeFile(wb, filename);

  toast.success(`${actualIngredients.length} ingredients exported successfully!`);
};

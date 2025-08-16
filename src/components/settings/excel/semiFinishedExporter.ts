import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  name_thai?: string;
  product_type: string;
  unit_type: string;
  unit_size: number;
  packages_per_batch: number;
  cost?: number;
  sales_price?: number;
  markup_percent?: number;
  shelf_life_days?: number;
  allergens?: string[];
  active: boolean;
  // Note: created_at and updated_at might not be available in all contexts
}

export const exportSemiFinishedToCSV = (products: Product[]) => {
  try {
    // Prepare data for export
    const exportData = products
      .filter(p => p.product_type === 'zelfgemaakt') // Only semi-finished products
      .map(product => ({
        'Product Name': product.name,
        'Thai Name': product.name_thai || '',
        'Unit Type': product.unit_type,
        'Unit Size': product.unit_size,
        'Packages Per Batch': product.packages_per_batch,
        'Cost': product.cost || '',
        'Sales Price': product.sales_price || '',
        'Markup %': product.markup_percent || '',
        'Shelf Life (Days)': product.shelf_life_days || '',
        'Allergens': product.allergens?.join(', ') || '',
        'Active': product.active ? 'Yes' : 'No',
        'Export Date': new Date().toLocaleDateString()
      }));

    if (exportData.length === 0) {
      toast.error('No semi-finished products found to export');
      return;
    }

    // Create CSV content
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `semi-finished-products-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success(`Exported ${exportData.length} semi-finished products to CSV`);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    toast.error('Failed to export to CSV');
  }
};

export const exportSemiFinishedToExcel = (products: Product[]) => {
  try {
    // Prepare data for export
    const exportData = products
      .filter(p => p.product_type === 'zelfgemaakt') // Only semi-finished products
      .map(product => ({
        'Product Name': product.name,
        'Thai Name': product.name_thai || '',
        'Unit Type': product.unit_type,
        'Unit Size': product.unit_size,
        'Packages Per Batch': product.packages_per_batch,
        'Cost': product.cost || '',
        'Sales Price': product.sales_price || '',
        'Markup %': product.markup_percent || '',
        'Shelf Life (Days)': product.shelf_life_days || '',
        'Allergens': product.allergens?.join(', ') || '',
        'Active': product.active ? 'Yes' : 'No',
        'Export Date': new Date().toLocaleDateString()
      }));

    if (exportData.length === 0) {
      toast.error('No semi-finished products found to export');
      return;
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = Object.keys(exportData[0]).map(key => ({
      wch: Math.max(
        key.length,
        ...exportData.map(row => String(row[key as keyof typeof row]).length)
      )
    }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Semi-Finished Products');

    // Generate filename with current date
    const filename = `semi-finished-products-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${exportData.length} semi-finished products to Excel`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Failed to export to Excel');
  }
};
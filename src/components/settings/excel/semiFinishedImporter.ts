import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SemiFinishedImportData {
  'Product Name': string;
  'Thai Name'?: string;
  'Unit Type': string;
  'Unit Size': number;
  'Packages Per Batch': number;
  'Cost'?: number;
  'Sales Price'?: number;
  'Markup %'?: number;
  'Shelf Life (Days)'?: number;
  'Allergens'?: string;
  'Active': string;
}

export interface ParsedSemiFinishedData {
  name: string;
  name_thai?: string;
  unit_type: string;
  unit_size: number;
  packages_per_batch: number;
  cost?: number;
  sales_price?: number;
  markup_percent?: number;
  shelf_life_days?: number;
  allergens?: string[];
  active: boolean;
  product_type: 'zelfgemaakt';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const parseSemiFinishedExcelFile = (file: File): Promise<SemiFinishedImportData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as SemiFinishedImportData[];
        
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const validateSemiFinishedData = (data: SemiFinishedImportData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (data.length === 0) {
    errors.push('No data found in file');
    return { valid: false, errors, warnings };
  }
  
  data.forEach((row, index) => {
    const rowNum = index + 2; // Account for header row
    
    // Required fields validation
    if (!row['Product Name']?.trim()) {
      errors.push(`Row ${rowNum}: Product Name is required`);
    }
    
    if (!row['Unit Type']?.trim()) {
      errors.push(`Row ${rowNum}: Unit Type is required`);
    }
    
    // Numeric fields validation
    if (row['Unit Size'] && (isNaN(Number(row['Unit Size'])) || Number(row['Unit Size']) <= 0)) {
      errors.push(`Row ${rowNum}: Unit Size must be a positive number`);
    }
    
    if (row['Packages Per Batch'] && (isNaN(Number(row['Packages Per Batch'])) || Number(row['Packages Per Batch']) <= 0)) {
      errors.push(`Row ${rowNum}: Packages Per Batch must be a positive number`);
    }
    
    if (row['Cost'] && String(row['Cost']).trim() !== '' && (isNaN(Number(row['Cost'])) || Number(row['Cost']) < 0)) {
      errors.push(`Row ${rowNum}: Cost must be a non-negative number`);
    }
    
    if (row['Sales Price'] && String(row['Sales Price']).trim() !== '' && (isNaN(Number(row['Sales Price'])) || Number(row['Sales Price']) < 0)) {
      errors.push(`Row ${rowNum}: Sales Price must be a non-negative number`);
    }
    
    if (row['Markup %'] && String(row['Markup %']).trim() !== '' && (isNaN(Number(row['Markup %'])) || Number(row['Markup %']) < 0)) {
      errors.push(`Row ${rowNum}: Markup % must be a non-negative number`);
    }
    
    if (row['Shelf Life (Days)'] && String(row['Shelf Life (Days)']).trim() !== '' && (isNaN(Number(row['Shelf Life (Days)'])) || Number(row['Shelf Life (Days)']) <= 0)) {
      errors.push(`Row ${rowNum}: Shelf Life must be a positive number`);
    }
    
    // Active field validation
    if (row['Active'] && !['Yes', 'No', 'yes', 'no', 'TRUE', 'FALSE', 'true', 'false'].includes(String(row['Active']))) {
      errors.push(`Row ${rowNum}: Active must be Yes/No or True/False`);
    }
    
    // Warnings for optional fields
    if (!row['Thai Name']) {
      warnings.push(`Row ${rowNum}: Thai Name is empty`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

export const convertToSemiFinishedData = (data: SemiFinishedImportData[]): ParsedSemiFinishedData[] => {
  return data.map(row => ({
    name: row['Product Name'].trim(),
    name_thai: row['Thai Name']?.trim() || null,
    unit_type: row['Unit Type'].trim(),
    unit_size: Number(row['Unit Size']),
    packages_per_batch: Number(row['Packages Per Batch']),
    cost: row['Cost'] && String(row['Cost']).trim() !== '' ? Number(row['Cost']) : null,
    sales_price: row['Sales Price'] && String(row['Sales Price']).trim() !== '' ? Number(row['Sales Price']) : null,
    markup_percent: row['Markup %'] && String(row['Markup %']).trim() !== '' ? Number(row['Markup %']) : null,
    shelf_life_days: row['Shelf Life (Days)'] && String(row['Shelf Life (Days)']).trim() !== '' ? Number(row['Shelf Life (Days)']) : null,
    allergens: row['Allergens'] ? row['Allergens'].split(',').map(a => a.trim()).filter(a => a) : [],
    active: ['Yes', 'yes', 'TRUE', 'true'].includes(String(row['Active'])),
    product_type: 'zelfgemaakt' as const
  }));
};

export const updateSemiFinishedProducts = async (products: ParsedSemiFinishedData[]) => {
  const results = [];
  const errors = [];
  
  for (const product of products) {
    try {
      // Check if product exists by name
      const { data: existingProducts, error: searchError } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .eq('product_type', 'zelfgemaakt');
      
      if (searchError) {
        errors.push(`Failed to search for product ${product.name}: ${searchError.message}`);
        continue;
      }
      
      if (existingProducts && existingProducts.length > 0) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update({
            name_thai: product.name_thai,
            unit_type: product.unit_type,
            unit_size: product.unit_size,
            packages_per_batch: product.packages_per_batch,
            cost: product.cost,
            sales_price: product.sales_price,
            markup_percent: product.markup_percent,
            shelf_life_days: product.shelf_life_days,
            allergens: product.allergens,
            active: product.active,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProducts[0].id)
          .select()
          .single();
        
        if (error) {
          errors.push(`Failed to update product ${product.name}: ${error.message}`);
        } else {
          results.push({ ...data, action: 'updated' });
        }
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            ...product,
            product_kind: 'zelfgemaakt'
          })
          .select()
          .single();
        
        if (error) {
          errors.push(`Failed to create product ${product.name}: ${error.message}`);
        } else {
          results.push({ ...data, action: 'created' });
        }
      }
    } catch (error) {
      errors.push(`Failed to process product ${product.name}: ${error}`);
    }
  }
  
  return { results, errors };
};

import * as XLSX from 'xlsx';

export interface ParsedIngredient {
  name: string;
  supplier_name?: string;
  supplier_package_unit: string;
  price_per_package: number;
  units_per_package: number;
  inner_unit_type: string;
  allergens: string[];
  pickable: boolean;
  product_type: string;
}

export interface ValidationResult {
  valid: ParsedIngredient[];
  errors: Array<{
    row: number;
    field?: string;
    error: string;
    data?: any;
  }>;
}

const VALID_PACKAGE_UNITS = ['bag', 'box', 'bottle', 'can', 'jar', 'piece', 'pack', 'roll', 'sheet'];
const VALID_INNER_UNITS = ['kg', 'gram', 'liter', 'ml', 'piece', 'meter', 'cm'];
const VALID_PRODUCT_TYPES = ['ingredient', 'semi-finished', 'extern', 'zelfgemaakt'];

export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON, starting from the header row (skip instructions)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          range: findHeaderRow(worksheet),
          header: 1,
          defval: ''
        });
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const findHeaderRow = (worksheet: XLSX.WorkSheet): number => {
  // Look for the row that contains "Name*" which indicates our header row
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
    const cell = worksheet[cellRef];
    if (cell && cell.v === 'Name*') {
      return row;
    }
  }
  
  return 0; // Default to first row if not found
};

export const validateIngredientData = async (data: any[]): Promise<ValidationResult> => {
  const valid: ParsedIngredient[] = [];
  const errors: ValidationResult['errors'] = [];
  
  // Skip empty rows and header row
  const dataRows = data.filter((row, index) => {
    if (index === 0) return false; // Skip header
    return Array.isArray(row) && row.some(cell => cell && cell.toString().trim());
  });
  
  dataRows.forEach((row, index) => {
    const actualRowNumber = index + 2; // +2 because we skip header and arrays are 0-indexed
    
    try {
      const [
        name,
        supplierName,
        packageUnit,
        pricePerPackage,
        unitsPerPackage,
        innerUnitType,
        allergens,
        pickable,
        productType
      ] = row;
      
      const errors_for_row: string[] = [];
      
      // Validate required fields
      if (!name || !name.toString().trim()) {
        errors_for_row.push('Name is required');
      }
      
      if (!packageUnit || !packageUnit.toString().trim()) {
        errors_for_row.push('Package Unit is required');
      } else if (!VALID_PACKAGE_UNITS.includes(packageUnit.toString().toLowerCase())) {
        errors_for_row.push(`Package Unit must be one of: ${VALID_PACKAGE_UNITS.join(', ')}`);
      }
      
      if (!pricePerPackage || isNaN(Number(pricePerPackage))) {
        errors_for_row.push('Price per Package must be a valid number');
      }
      
      if (!unitsPerPackage || isNaN(Number(unitsPerPackage)) || Number(unitsPerPackage) <= 0) {
        errors_for_row.push('Units per Package must be a positive number');
      }
      
      if (!innerUnitType || !innerUnitType.toString().trim()) {
        errors_for_row.push('Inner Unit Type is required');
      } else if (!VALID_INNER_UNITS.includes(innerUnitType.toString().toLowerCase())) {
        errors_for_row.push(`Inner Unit Type must be one of: ${VALID_INNER_UNITS.join(', ')}`);
      }
      
      if (!productType || !productType.toString().trim()) {
        errors_for_row.push('Product Type is required');
      } else if (!VALID_PRODUCT_TYPES.includes(productType.toString().toLowerCase())) {
        errors_for_row.push(`Product Type must be one of: ${VALID_PRODUCT_TYPES.join(', ')}`);
      }
      
      // Validate pickable
      const pickableStr = pickable?.toString().toLowerCase();
      if (pickableStr && !['yes', 'no', 'true', 'false'].includes(pickableStr)) {
        errors_for_row.push('Pickable must be "Yes" or "No"');
      }
      
      if (errors_for_row.length > 0) {
        errors.push({
          row: actualRowNumber,
          error: errors_for_row.join('; '),
          data: { name: name?.toString() || 'Unknown' }
        });
      } else {
        // Create valid ingredient object
        const ingredient: ParsedIngredient = {
          name: name.toString().trim(),
          supplier_name: supplierName?.toString().trim() || null,
          supplier_package_unit: packageUnit.toString().toLowerCase(),
          price_per_package: Number(pricePerPackage),
          units_per_package: Number(unitsPerPackage),
          inner_unit_type: innerUnitType.toString().toLowerCase(),
          allergens: allergens ? 
            allergens.toString().split(',').map(a => a.trim()).filter(a => a) : 
            [],
          pickable: ['yes', 'true'].includes(pickableStr),
          product_type: productType.toString().toLowerCase()
        };
        
        valid.push(ingredient);
      }
      
    } catch (error) {
      errors.push({
        row: actualRowNumber,
        error: 'Failed to parse row data',
        data: { raw: row }
      });
    }
  });
  
  return { valid, errors };
};

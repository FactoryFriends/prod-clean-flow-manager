
import * as XLSX from 'xlsx';
import { ALLERGENS_ENGLISH } from '@/components/ingredients/constants/allergens';

export const downloadExcelTemplate = () => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Instructions sheet
  const instructionsData = [
    ['EXCEL IMPORT TEMPLATE - INGREDIENTS'],
    [''],
    ['INSTRUCTIONS:'],
    ['1. Fill out the "Data" sheet with your ingredient information'],
    ['2. Follow the validation rules below carefully'],
    ['3. Save the file and upload it back to the system'],
    [''],
    ['VALIDATION RULES:'],
    [''],
    ['Package Units (choose one):'],
    ['bag, box, bottle, can, jar, piece, pack, roll, sheet'],
    [''],
    ['Inner Unit Types (choose one):'],
    ['kg, gram, liter, ml, piece, meter, cm'],
    [''],
    ['Product Types (choose one):'],
    ['zelfgemaakt, extern, ingredient, semi-finished'],
    [''],
    ['Pickable (choose one):'],
    ['Yes, No, True, False'],
    [''],
    ['Valid Allergens (separate multiple with commas):'],
    ...ALLERGENS_ENGLISH.map(allergen => [allergen]),
    [''],
    ['SUPPLIER NOTES:'],
    ['- For external products: supplier name is required'],
    ['- If supplier doesn\'t exist, it will be created automatically'],
    ['- For "zelfgemaakt" products: leave supplier empty'],
    [''],
    ['IMPORTANT:'],
    ['- All ingredient names must be unique'],
    ['- Required fields are marked with * in the header'],
    ['- Price and quantity fields must be valid numbers'],
  ];
  
  const instructionsWS = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(wb, instructionsWS, 'Instructions');
  
  // Data sheet with headers and example
  const headers = [
    'Name*',
    'Supplier Name',
    'Package Unit*',
    'Price per Package*',
    'Units per Package*',
    'Inner Unit Type*',
    'Allergens',
    'Pickable*',
    'Product Type*'
  ];
  
  const exampleData = [
    [
      'Tomato Sauce',
      'Italian Foods Co',
      'can',
      12.50,
      24,
      'piece',
      'No Allergens',
      'Yes',
      'extern'
    ],
    [
      'Fresh Basil',
      '',
      'bag',
      3.00,
      1,
      'kg',
      'No Allergens',
      'Yes',
      'zelfgemaakt'
    ],
    [
      'Mozzarella Cheese',
      'Dairy Direct',
      'box',
      18.00,
      12,
      'piece',
      'Milk',
      'Yes',
      'extern'
    ]
  ];
  
  const dataSheet = [headers, ...exampleData];
  const dataWS = XLSX.utils.aoa_to_sheet(dataSheet);
  
  // Set column widths for better readability
  const colWidths = [
    { wch: 20 }, // Name
    { wch: 15 }, // Supplier Name
    { wch: 12 }, // Package Unit
    { wch: 15 }, // Price per Package
    { wch: 15 }, // Units per Package
    { wch: 15 }, // Inner Unit Type
    { wch: 20 }, // Allergens
    { wch: 10 }, // Pickable
    { wch: 12 }  // Product Type
  ];
  dataWS['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, dataWS, 'Data');
  
  // Generate and download the file
  const filename = `ingredient_import_template_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};

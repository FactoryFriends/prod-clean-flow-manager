
import * as XLSX from 'xlsx';

export const downloadExcelTemplate = () => {
  // Define the template headers
  const headers = [
    'Name*',
    'Supplier Name',
    'Package Unit*',
    'Price per Package (€)*',
    'Units per Package*',
    'Inner Unit Type*',
    'Allergens (comma separated)',
    'Pickable (Yes/No)',
    'Product Type*'
  ];

  // Sample data to show format
  const sampleData = [
    [
      'Organic Flour',
      'BioBest Suppliers',
      'bag',
      '15.50',
      '25',
      'kg',
      'gluten',
      'Yes',
      'ingredient'
    ],
    [
      'Olive Oil Extra Virgin',
      'Mediterranean Foods',
      'bottle',
      '8.75',
      '12',
      'liter',
      '',
      'Yes',
      'ingredient'
    ]
  ];

  // Instructions
  const instructions = [
    'INSTRUCTIONS:',
    '1. Fill out the template below with your ingredient data',
    '2. Fields marked with * are required',
    '3. Package Unit options: bag, box, bottle, can, jar, piece, pack, roll, sheet',
    '4. Inner Unit Type options: kg, gram, liter, ml, piece, meter, cm',
    '5. Product Type options: ingredient, semi-finished, extern, zelfgemaakt',
    '6. Pickable: Enter "Yes" or "No"',
    '7. Multiple allergens can be separated by commas',
    '8. Save the file and upload it back to the system',
    '',
    'SAMPLE DATA (delete these rows and add your own):'
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with instructions, headers, and sample data
  const wsData = [
    ...instructions.map(instruction => [instruction]),
    [], // Empty row
    headers,
    ...sampleData
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  const colWidths = [
    { wch: 25 }, // Name
    { wch: 20 }, // Supplier Name
    { wch: 15 }, // Package Unit
    { wch: 18 }, // Price per Package
    { wch: 18 }, // Units per Package
    { wch: 18 }, // Inner Unit Type
    { wch: 25 }, // Allergens
    { wch: 15 }, // Pickable
    { wch: 15 }  // Product Type
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredients Template');
  
  // Generate and download file
  const fileName = `ingredients-import-template-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

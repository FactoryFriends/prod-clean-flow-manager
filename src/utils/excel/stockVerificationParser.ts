import * as XLSX from 'xlsx';

export interface StockAdjustmentRow {
  batchNumber: string;
  productName: string;
  systemStock: number;
  physicalCount: number;
  adjustment: number;
  notes?: string;
}

export interface ParsedStockVerification {
  rows: StockAdjustmentRow[];
  stocktakerName?: string;
  verificationDate?: string;
}

export const parseStockVerificationExcel = async (file: File): Promise<ParsedStockVerification> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        // Find header row
        const headerRowIndex = jsonData.findIndex(row => 
          row[0]?.toString().toLowerCase().includes('batch') ||
          row[0]?.toString().toLowerCase() === 'batch number'
        );

        if (headerRowIndex === -1) {
          throw new Error('Could not find header row with "Batch Number" column');
        }

        const rows: StockAdjustmentRow[] = [];
        let stocktakerName: string | undefined;
        let verificationDate: string | undefined;

        // Parse data rows
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // Stop if we hit the stocktaker information section
          if (row[0]?.toString().toLowerCase().includes('stocktaker')) {
            break;
          }

          // Skip empty rows
          if (!row[0] || row[0].toString().trim() === '') {
            continue;
          }

          const batchNumber = row[0]?.toString().trim();
          const productName = row[1]?.toString().trim() || '';
          const systemStock = parseInt(row[4]?.toString() || '0');
          const physicalCount = parseInt(row[5]?.toString() || '0');
          const notes = row[6]?.toString().trim() || undefined;

          // Only include rows with valid batch numbers
          if (batchNumber && !isNaN(systemStock) && !isNaN(physicalCount)) {
            rows.push({
              batchNumber,
              productName,
              systemStock,
              physicalCount,
              adjustment: physicalCount - systemStock,
              notes
            });
          }
        }

        // Extract stocktaker information if present
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row[0]?.toString().toLowerCase().includes('name:')) {
            stocktakerName = row[1]?.toString().trim();
          }
          if (row[0]?.toString().toLowerCase().includes('date:')) {
            verificationDate = row[1]?.toString().trim();
          }
        }

        resolve({
          rows,
          stocktakerName,
          verificationDate
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

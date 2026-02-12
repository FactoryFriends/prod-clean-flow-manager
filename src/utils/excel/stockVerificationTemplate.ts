import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { BatchWithStock } from "@/hooks/useBatchStock";
import { toast } from "sonner";

export const downloadStockVerificationTemplate = (
  batches: BatchWithStock[],
  location: string
) => {
  if (!batches.length) {
    toast.error("No batches to export");
    return;
  }

  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Header row (matching parser expectations from stockVerificationParser.ts)
  const headers = [
    "Batch Number",
    "Product Name", 
    "Production Date",
    "Expiry Date",
    "Status",
    "System Stock",
    "Physical Count",
    "Notes"
  ];

  // Data rows - sorted by product name for easier verification
  const sortedBatches = [...batches].sort((a, b) => 
    (a.products?.name || "").localeCompare(b.products?.name || "")
  );

  const today = new Date().toISOString().split('T')[0];
  const data = sortedBatches.map(batch => [
    batch.batch_number,
    batch.products?.name || "",
    format(new Date(batch.production_date), "yyyy-MM-dd"),
    format(new Date(batch.expiry_date), "yyyy-MM-dd"),
    batch.expiry_date < today ? "EXPIRED" : "OK",
    batch.packages_in_stock, // System stock (current)
    "", // Physical Count - to be filled by user
    ""  // Notes - optional
  ]);

  // Stocktaker info section (at the end, matching parser expectations)
  const stocktakerSection = [
    [], // Empty row separator
    ["Stocktaker Name:", ""],
    ["Date:", format(new Date(), "yyyy-MM-dd")]
  ];

  // Combine all rows
  const wsData = [headers, ...data, ...stocktakerSection];
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for better readability
  ws['!cols'] = [
    { wch: 22 }, // Batch Number
    { wch: 35 }, // Product Name
    { wch: 14 }, // Production Date
    { wch: 14 }, // Expiry Date
    { wch: 10 }, // Status
    { wch: 14 }, // System Stock
    { wch: 16 }, // Physical Count
    { wch: 35 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Stock Verification");
  
  // Generate filename with location and date
  const filename = `Stock_Verification_${location.toUpperCase()}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(wb, filename);
  
  toast.success("Stock verification template downloaded");
};

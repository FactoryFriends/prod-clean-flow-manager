
import { format } from "date-fns";
import { toast } from "sonner";
import { downloadCSV } from "./csvDownloadUtils";

interface StockTake {
  id: string;
  batch_number: string;
  created_at: string;
  production_date: string;
  expiry_date: string;
  packages_produced: number;
  production_notes?: string | null;
  products?: {
    name?: string;
    unit_type?: string;
  } | null;
  chefs?: {
    name?: string;
  } | null;
}

export const exportStockTakesCSV = (stockTakes: StockTake[]) => {
  if (!stockTakes.length) {
    toast.error("No stock takes to export");
    return;
  }

  const csvHeaders = [
    "Batch Number",
    "Date Created",
    "Product Name",
    "Production Date",
    "Expiry Date",
    "Packages Produced",
    "Chef Name",
    "Unit Type",
    "Production Notes"
  ];

  const csvData = stockTakes.map(batch => [
    batch.batch_number,
    format(new Date(batch.created_at), "yyyy-MM-dd HH:mm"),
    batch.products?.name || "",
    format(new Date(batch.production_date), "yyyy-MM-dd"),
    format(new Date(batch.expiry_date), "yyyy-MM-dd"),
    batch.packages_produced,
    batch.chefs?.name || "",
    batch.products?.unit_type || "",
    batch.production_notes || ""
  ]);

  const csvContent = [
    csvHeaders.join(";"),
    ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(";"))
  ].join("\n");

  downloadCSV(csvContent, `FAVV_Stock_Takes_${format(new Date(), "yyyy-MM-dd")}.csv`);
};

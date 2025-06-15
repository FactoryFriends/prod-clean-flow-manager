
import { format } from "date-fns";
import { toast } from "sonner";
import { downloadCSV } from "./csvDownloadUtils";

interface PackingSlip {
  id: string;
  slip_number: string;
  created_at: string;
  destination: string;
  total_items: number;
  total_packages: number;
  prepared_by?: string | null;
  picked_up_by?: string | null;
  pickup_date?: string | null;
  dispatch_records?: {
    location?: string;
    dispatch_type?: string;
    customer?: string;
    picker_name?: string;
    dispatch_notes?: string;
  } | null;
  batches?: {
    id: string;
    batch_number: string;
    production_date: string;
    expiry_date: string;
    products: {
      name: string;
      unit_size: number;
      unit_type: string;
      product_type: string;
      supplier_name: string | null;
    };
  }[];
}

export const exportPackingSlipsCSV = (packingSlips: PackingSlip[]) => {
  if (!packingSlips.length) {
    toast.error("No packing slips to export");
    return;
  }

  const csvHeaders = [
    "Packing Slip Number",
    "Date Created",
    "Produced By",
    "Destination",
    "Dispatch Type",
    "Customer",
    "Picker Name",
    "Prepared By",
    "Picked Up By",
    "Total Items",
    "Total Packages",
    "Pickup Date",
    "Notes",
    "Productnaam",
    "Batchnummer"
  ];

  const csvData: string[][] = [];

  packingSlips.forEach((slip) => {
    let hadBatch = false;
    if (slip.batches && slip.batches.length > 0) {
      hadBatch = true;
      slip.batches.forEach((batch) => {
        let producedByVal = "";
        if (batch.products?.product_type === "zelfgemaakt") {
          producedByVal = "TOTHAI PRODUCTION";
        } else if (batch.products?.product_type === "extern" && batch.products?.supplier_name) {
          producedByVal = batch.products.supplier_name;
        } else {
          producedByVal = "";
        }
        csvData.push([
          slip.slip_number,
          format(new Date(slip.created_at), "yyyy-MM-dd HH:mm"),
          producedByVal,
          slip.destination,
          slip.dispatch_records?.dispatch_type || "",
          slip.dispatch_records?.customer || "",
          slip.dispatch_records?.picker_name || "",
          slip.prepared_by || "",
          slip.picked_up_by || "",
          slip.total_items.toString(),
          slip.total_packages.toString(),
          slip.pickup_date ? format(new Date(slip.pickup_date), "yyyy-MM-dd") : "",
          slip.dispatch_records?.dispatch_notes || "",
          batch.products?.name || "",
          batch.batch_number || "",
        ]);
      });
    }
    if (!hadBatch) {
      let producedByVal = "";
      if (slip.dispatch_records?.location === "tothai") {
        producedByVal = "TOTHAI PRODUCTION";
      } else if (slip.destination) {
        producedByVal = slip.destination;
      } else {
        producedByVal = "";
      }

      csvData.push([
        slip.slip_number,
        format(new Date(slip.created_at), "yyyy-MM-dd HH:mm"),
        producedByVal,
        slip.destination,
        slip.dispatch_records?.dispatch_type || "",
        slip.dispatch_records?.customer || "",
        slip.dispatch_records?.picker_name || "",
        slip.prepared_by || "",
        slip.picked_up_by || "",
        slip.total_items.toString(),
        slip.total_packages.toString(),
        slip.pickup_date ? format(new Date(slip.pickup_date), "yyyy-MM-dd") : "",
        slip.dispatch_records?.dispatch_notes || "",
        "",
        "",
      ]);
    }
    // Add a blank line after each packing slip
    csvData.push(Array(csvHeaders.length).fill(""));
  });

  const csvContent = [
    csvHeaders.join(";"),
    ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(";"))
  ].join("\n");

  downloadCSV(csvContent, `FAVV_Packing_Slips_${format(new Date(), "yyyy-MM-dd")}.csv`);
};


import { format } from "date-fns";
import { toast } from "sonner";

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
}

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

interface CompletedTask {
  id: string;
  title: string;
  description?: string | null;
  location: "tothai" | "khin";
  scheduled_date: string;
  completed_at: string | null;
  completed_by: string | null;
  assigned_role?: string | null;
  favv_compliance?: boolean | null;
  estimated_duration?: number | null;
  actual_duration?: number | null;
  completion_notes?: string | null;
  staff_codes?: {
    initials: string;
  } | null;
}

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("CSV file downloaded successfully");
};

export const exportPackingSlipsCSV = (packingSlips: PackingSlip[]) => {
  if (!packingSlips.length) {
    toast.error("No packing slips to export");
    return;
  }

  const csvHeaders = [
    "Packing Slip Number",
    "Date Created",
    "Location",
    "Destination",
    "Dispatch Type", 
    "Customer",
    "Picker Name",
    "Prepared By",
    "Picked Up By",
    "Total Items",
    "Total Packages",
    "Pickup Date",
    "Notes"
  ];

  const csvData = packingSlips.map(slip => [
    slip.slip_number,
    format(new Date(slip.created_at), "yyyy-MM-dd HH:mm"),
    slip.dispatch_records?.location || "",
    slip.destination,
    slip.dispatch_records?.dispatch_type || "",
    slip.dispatch_records?.customer || "",
    slip.dispatch_records?.picker_name || "",
    slip.prepared_by || "",
    slip.picked_up_by || "",
    slip.total_items,
    slip.total_packages,
    slip.pickup_date ? format(new Date(slip.pickup_date), "yyyy-MM-dd") : "",
    slip.dispatch_records?.dispatch_notes || ""
  ]);

  const csvContent = [
    csvHeaders.join(","),
    ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(","))
  ].join("\n");

  downloadCSV(csvContent, `FAVV_Packing_Slips_${format(new Date(), "yyyy-MM-dd")}.csv`);
};

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
    csvHeaders.join(","),
    ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(","))
  ].join("\n");

  downloadCSV(csvContent, `FAVV_Stock_Takes_${format(new Date(), "yyyy-MM-dd")}.csv`);
};

export const exportCompletedTasksCSV = (completedTasks: CompletedTask[]) => {
  if (!completedTasks.length) {
    toast.error("No completed tasks to export");
    return;
  }

  const csvHeaders = [
    "Task Title",
    "Description",
    "Location",
    "Scheduled Date",
    "Completed Date",
    "Completed By",
    "Assigned Role",
    "FAVV Compliance",
    "Estimated Duration (min)",
    "Actual Duration (min)",
    "Completion Notes"
  ];

  const csvData = completedTasks.map(task => [
    task.title,
    task.description || "",
    task.location?.toUpperCase() || "",
    format(new Date(task.scheduled_date), "yyyy-MM-dd"),
    task.completed_at ? format(new Date(task.completed_at), "yyyy-MM-dd HH:mm") : "",
    task.staff_codes?.initials || task.completed_by || "",
    task.assigned_role || "",
    task.favv_compliance ? "Yes" : "No",
    task.estimated_duration || "",
    task.actual_duration || "",
    task.completion_notes || ""
  ]);

  const csvContent = [
    csvHeaders.join(","),
    ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(","))
  ].join("\n");

  downloadCSV(csvContent, `FAVV_Completed_Tasks_${format(new Date(), "yyyy-MM-dd")}.csv`);
};

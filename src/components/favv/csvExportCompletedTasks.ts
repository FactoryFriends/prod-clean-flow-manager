
import { format } from "date-fns";
import { toast } from "sonner";
import { downloadCSV } from "./csvDownloadUtils";

interface CompletedTask {
  id: string;
  title: string;
  description?: string | null;
  location: "tothai" | "khin" | "both";
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
    csvHeaders.join(";"),
    ...csvData.map(row => row.map(cell => `"${cell || ""}"`).join(";"))
  ].join("\n");

  downloadCSV(csvContent, `FAVV_Completed_Tasks_${format(new Date(), "yyyy-MM-dd")}.csv`);
};

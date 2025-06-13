
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "completed" | "in-progress" | "pending" | "overdue" | "shipped" | "delivered";
  size?: "sm" | "md";
}

const statusConfig = {
  completed: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800 border-blue-200" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  overdue: { label: "Overdue", className: "bg-red-100 text-red-800 border-red-200" },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800 border-green-200" },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center border rounded-full font-medium",
      config.className,
      size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"
    )}>
      {config.label}
    </span>
  );
}

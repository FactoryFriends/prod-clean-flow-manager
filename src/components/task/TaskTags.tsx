
import { StatusBadge } from "../StatusBadge";
import { Badge } from "../ui/badge";

interface TaskTagsProps {
  assignedRole: "chef" | "cleaner" | "other" | null;
  favvCompliance: boolean | null;
  status: "open" | "closed";
}

export function TaskTags({ assignedRole, favvCompliance, status }: TaskTagsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
      {assignedRole && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {assignedRole.toUpperCase()}
        </Badge>
      )}
      {favvCompliance && (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          FAVV
        </Badge>
      )}
      <StatusBadge status={status} size="sm" />
    </div>
  );
}

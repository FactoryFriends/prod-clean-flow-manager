
import { AlertTriangle } from "lucide-react";
import { FAVVReport } from "./FAVVReport";
import { NewCleaningTaskDialog } from "./NewCleaningTaskDialog";
import { Badge } from "./ui/badge";

interface CleaningTaskHeaderProps {
  locationName: string;
  currentLocation: "tothai" | "khin";
  overdueCount?: number;
}

export function CleaningTaskHeader({ locationName, currentLocation, overdueCount = 0 }: CleaningTaskHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-foreground">Cleaning Tasks</h1>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {overdueCount} Overdue
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Manage cleaning and maintenance tasks at {locationName}
        </p>
        {overdueCount > 0 && (
          <p className="text-sm text-red-600 mt-1">
            {overdueCount} task{overdueCount > 1 ? 's' : ''} overdue ({'>'}48 hours) - Immediate attention required!
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <FAVVReport currentLocation={currentLocation} />
        <NewCleaningTaskDialog currentLocation={currentLocation} />
      </div>
    </div>
  );
}

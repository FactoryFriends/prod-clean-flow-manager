
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { FAVVReport } from "./FAVVReport";

interface CleaningTaskHeaderProps {
  locationName: string;
  currentLocation: string;
}

export function CleaningTaskHeader({ locationName, currentLocation }: CleaningTaskHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Cleaning Tasks</h1>
        <p className="text-muted-foreground">
          Manage cleaning and maintenance tasks at {locationName}
        </p>
      </div>
      <div className="flex gap-2">
        <FAVVReport currentLocation={currentLocation} />
        <Button className="flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" />
          New Cleaning Task
        </Button>
      </div>
    </div>
  );
}

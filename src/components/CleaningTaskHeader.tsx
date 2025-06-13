
import { FAVVReport } from "./FAVVReport";
import { NewCleaningTaskDialog } from "./NewCleaningTaskDialog";

interface CleaningTaskHeaderProps {
  locationName: string;
  currentLocation: "tothai" | "khin";
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
        <NewCleaningTaskDialog currentLocation={currentLocation} />
      </div>
    </div>
  );
}

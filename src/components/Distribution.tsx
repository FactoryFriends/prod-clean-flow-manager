
import { Truck } from "lucide-react";
import { Dispatch } from "./Dispatch";

interface DistributionProps {
  currentLocation: "tothai" | "khin";
}

export function Distribution({ currentLocation }: DistributionProps) {
  const getLocationName = (location: string) => {
    return location === "tothai" ? "To Thai Restaurant" : "Khin Takeaway";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Distribution Management</h1>
          <p className="text-muted-foreground">
            Create packing slips and manage dispatch from {getLocationName(currentLocation)}
          </p>
        </div>
      </div>

      <Dispatch currentLocation={currentLocation} />
    </div>
  );
}

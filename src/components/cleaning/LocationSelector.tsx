
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ContextualHelp } from "@/components/help/ContextualHelp";

interface LocationSelectorProps {
  selectedLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

export function LocationSelector({ selectedLocation, onLocationChange }: LocationSelectorProps) {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-2">
        <Button
          variant={selectedLocation === 'tothai' ? 'default' : 'outline'}
          onClick={() => onLocationChange('tothai')}
          className={cn(
            "px-4 py-2",
            selectedLocation === 'tothai' 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          )}
        >
          ToThai Restaurant
        </Button>
        <Button
          variant={selectedLocation === 'khin' ? 'default' : 'outline'}
          onClick={() => onLocationChange('khin')}
          className={cn(
            "px-4 py-2",
            selectedLocation === 'khin' 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          )}
        >
          KHIN Restaurant
        </Button>
      </div>
      <ContextualHelp helpKey="cleaning.location-selector" side="bottom" />
    </div>
  );
}

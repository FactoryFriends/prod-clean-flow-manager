
import { MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LocationSwitcherProps {
  currentLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

const locations = [
  { id: "tothai" as const, name: "ToThai Production Facility", address: "Main Production & Distribution" },
  { id: "khin" as const, name: "KHIN Restaurant", address: "Restaurant Operations" },
];

export function LocationSwitcher({ currentLocation, onLocationChange }: LocationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const current = locations.find(loc => loc.id === currentLocation) || locations[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <div className="text-left">
          <div className="text-sm font-medium text-foreground">{current.name}</div>
          <div className="text-xs text-muted-foreground">{current.address}</div>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg z-50">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => {
                onLocationChange(location.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full p-3 text-left hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg",
                location.id === currentLocation && "bg-accent"
              )}
            >
              <div className="text-sm font-medium text-foreground">{location.name}</div>
              <div className="text-xs text-muted-foreground">{location.address}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

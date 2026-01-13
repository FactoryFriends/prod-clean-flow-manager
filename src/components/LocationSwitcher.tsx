import { MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LocationSwitcherProps {
  currentLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

const locations = [
  { id: "tothai" as const, name: "ToThai Production Facility", address: "Main Production & Distribution" },
  { id: "khin" as const, name: "KHIN Restaurant", address: "Restaurant Operations" },
];

export function LocationSwitcher({ currentLocation, onLocationChange }: LocationSwitcherProps) {
  const current = locations.find(loc => loc.id === currentLocation) || locations[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <MapPin className="w-4 h-4 text-primary" />
          <div className="text-left">
            <div className="text-sm font-medium text-foreground">{current.name}</div>
            <div className="text-xs text-muted-foreground">{current.address}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        {locations.map((location) => (
          <DropdownMenuItem
            key={location.id}
            onClick={() => onLocationChange(location.id)}
            className={cn(
              "flex flex-col items-start p-3 cursor-pointer",
              location.id === currentLocation && "bg-accent"
            )}
          >
            <div className="text-sm font-medium text-foreground">{location.name}</div>
            <div className="text-xs text-muted-foreground">{location.address}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LocationHeaderProps {
  currentLocation: "tothai" | "khin";
  onLocationChange: (location: "tothai" | "khin") => void;
}

export function LocationHeader({ currentLocation, onLocationChange }: LocationHeaderProps) {
  const isMobile = useIsMobile();

  const getLocationStyles = (location: "tothai" | "khin") => {
    if (location === "tothai") {
      return {
        bg: "bg-tothai-primary",
        text: "text-tothai-accent",
        border: "border-tothai-secondary",
        name: "ToThai Restaurant"
      };
    } else {
      return {
        bg: "bg-khin-primary", 
        text: "text-khin-accent",
        border: "border-khin-secondary",
        name: "KHIN Restaurant"
      };
    }
  };

  const currentStyles = getLocationStyles(currentLocation);
  const displayName = isMobile ? (currentLocation === "tothai" ? "ToThai" : "KHIN") : currentStyles.name;

  return (
    <div className="flex items-center justify-end border-b bg-background px-4 py-2 gap-3">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm",
        currentStyles.bg,
        currentStyles.text,
        "shadow-sm"
      )}>
        <MapPin className="w-4 h-4" />
        <span>{displayName}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {isMobile ? "Switch" : "Switch Location"}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onLocationChange("tothai")}
            className={cn(
              "flex items-center gap-2",
              currentLocation === "tothai" && "bg-tothai-primary/10"
            )}
          >
            <div className="w-3 h-3 rounded-full bg-tothai-primary"></div>
            ToThai Restaurant
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onLocationChange("khin")}
            className={cn(
              "flex items-center gap-2",
              currentLocation === "khin" && "bg-khin-primary/10"
            )}
          >
            <div className="w-3 h-3 rounded-full bg-khin-primary"></div>
            KHIN Restaurant
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
